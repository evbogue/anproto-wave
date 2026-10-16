// ANProto Wave v2: bounded signed events, causal validation, and an RGA sequence.
import { an } from './vendor/an.js';
export { an };
export const LIMITS = Object.freeze({bytes:65536, events:10000, deps:256, ops:128, run:4096, targets:8192, text:200000});
const hashRE = /^[A-Za-z0-9+/]{43}=$/;
export const isHash = x => typeof x === 'string' && hashRE.test(x);
const str = (x,n) => typeof x === 'string' && x.length <= n;
const exact = (value,fields) => value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).length===fields.length && fields.every(f=>Object.hasOwn(value,f));
const unique = xs => new Set(xs).size === xs.length;
const hashes = (xs,n) => Array.isArray(xs) && xs.length <= n && xs.every(isHash) && unique(xs);
const elementRE = /^([A-Za-z0-9+/]{43}=):(\d+):(\d+)$/;
const element = x => typeof x === 'string' && elementRE.test(x);
const scalars = x => !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(x);
export const elementId = (event,op,index) => `${event}:${op}:${index}`;
export async function sign(data,key) {
  const content = JSON.stringify({version:2,...data});
  const record = {content,message:await an.sign(await an.hash(content),key)};
  await verify(record); return record;
}
export async function verify(record) {
  if (!record || typeof record.message !== 'string' || record.message.length !== 208 || !str(record.content,LIMITS.bytes) || new TextEncoder().encode(record.content).length > LIMITS.bytes) throw Error('Invalid record size');
  const opened = await an.open(record.message);
  if (!/^\d{13}[A-Za-z0-9+/]{43}=$/.test(opened) || await an.hash(record.content) !== opened.slice(13)) throw Error('Signature or content mismatch');
  const d = JSON.parse(record.content);
  if (d.version !== 2) throw Error('Unsupported protocol version');
  const fields={wave:['title','participants'],profile:['name','image'],presence:['wave','blip'],thread:['wave','deps','parent','anchor'],blip:['wave','deps','thread','after','text'],edit:['wave','deps','blip','ops']}[d.type];
  if(!fields||!exact(d,['version','type',...fields]))throw Error('Unsupported event fields');
  let valid = false;
  if(d.type === 'wave') valid = str(d.title,150) && d.title.trim() && hashes(d.participants,30);
  else if(d.type === 'presence') valid = isHash(d.wave) && isHash(d.blip);
  else if(d.type === 'profile') valid = str(d.name,100) && d.name.trim() && (d.image === null || isHash(d.image));
  else if(isHash(d.wave) && hashes(d.deps,LIMITS.deps) && d.deps.length) {
    if(d.type === 'thread') valid = (d.parent === null || isHash(d.parent)) && (d.anchor === null || (d.parent !== null && exact(d.anchor,['ids','quote']) && Array.isArray(d.anchor.ids) && d.anchor.ids.length > 0 && d.anchor.ids.length <= LIMITS.targets && d.anchor.ids.every(element) && unique(d.anchor.ids) && str(d.anchor.quote,16384) && scalars(d.anchor.quote)));
    if(d.type === 'blip') valid = isHash(d.thread) && (d.after === null || isHash(d.after)) && str(d.text,LIMITS.run) && scalars(d.text);
    if(d.type === 'edit') valid = isHash(d.blip) && Array.isArray(d.ops) && d.ops.length > 0 && d.ops.length <= LIMITS.ops && d.ops.every(o => o.kind === 'insert' ? exact(o,['kind','after','text']) && (o.after === null || element(o.after)) && str(o.text,LIMITS.run) && o.text.length > 0 && scalars(o.text) : o.kind === 'delete' && exact(o,['kind','ids']) && Array.isArray(o.ids) && o.ids.length > 0 && o.ids.length <= LIMITS.targets && o.ids.every(element) && unique(o.ids));
  }
  if(!valid) throw Error('Invalid event fields');
  return {content:record.content,message:record.message,data:d,author:record.message.slice(0,44),time:Number(opened.slice(0,13)),id:await an.hash(record.message)};
}
const compare = (a,b) => a < b ? -1 : a > b ? 1 : 0;
const newer = (a,b) => b.clock-a.clock || -compare(a.event,b.event) || b.op-a.op || b.index-a.index;
export function sequence(blip) {
  const children = new Map();
  for(const e of blip.elements.values()) { const xs=children.get(e.after)||[]; xs.push(e); children.set(e.after,xs); }
  for(const xs of children.values()) xs.sort(newer);
  const all=[], stack=[...(children.get(null)||[])].reverse();
  while(stack.length) { const e=stack.pop(); all.push(e); const xs=children.get(e.id)||[]; for(let i=xs.length-1;i>=0;i--)stack.push(xs[i]); }
  const visible=all.filter(e=>!blip.deleted.has(e.id));
  return {all,visible,text:visible.map(e=>e.value).join('')};
}
function insert(blip,record,op,text,after,clock) {
  Array.from(text).forEach((value,index)=>{const id=elementId(record.id,op,index);blip.elements.set(id,{id,event:record.id,op,index,value,after,clock});after=id;});
}
// Input must consist of verify() results. Never apply parsed, unverified network data.
export function project(input,wave) {
  const records = new Map(input.map(r=>[r.id,r]));
  if(records.size>LIMITS.events)throw Error('Event inventory limit exceeded');
  const root=records.get(wave);
  if(root?.data.type !== 'wave') return null;
  const members=new Set([root.author,...root.data.participants]);
  const accepted=new Map([[wave,{...root,clock:0}]]), rejected=new Map(), threads=new Map(),blips=new Map();
  const ancestry=new Map([[wave,new Set()]]);
  let pending=[...records.values()].filter(r=>r.data.wave===wave&&r.data.type!=='presence').sort((a,b)=>compare(a.id,b.id));
  for(const r of pending)if(!members.has(r.author))rejected.set(r.id,'Nonmember author');
  pending=pending.filter(r=>!rejected.has(r.id));
  let progress=true;
  while(progress) {
    progress=false;
    pending=pending.filter(r=>{
      const d=r.data;
      if(d.deps.some(id=>rejected.has(id))) { rejected.set(r.id,'Rejected dependency');progress=true;return false; }
      if(d.deps.some(id=>records.has(id)&&!accepted.has(id)&&records.get(id).data.wave!==wave)){rejected.set(r.id,'Cross-Wave dependency');progress=true;return false;}
      if(!d.deps.every(id=>accepted.has(id)))return true;
      const ancestors=new Set(d.deps);
      for(const id of d.deps)for(const a of ancestry.get(id))ancestors.add(a);
      const clock=1+Math.max(...d.deps.map(id=>accepted.get(id).clock));
      const knows=id=>ancestors.has(id);
      const owns=(b,id)=>b.elements.has(id)&&knows(b.elements.get(id).event);
      try {
        if(!knows(wave))throw Error('Missing root ancestry');
        if(d.type==='thread') {
          const parent=d.parent===null?null:blips.get(d.parent);
          if(d.parent!==null&&(!parent||!knows(d.parent)))throw Error('Invalid parent');
          if(d.anchor) {
            if(!d.anchor.ids.every(id=>owns(parent,id)))throw Error('Invalid anchor ownership');
            // Validate against exactly the author's causal view, excluding concurrent edits.
            const view={elements:new Map([...parent.elements].filter(([,e])=>knows(e.event))),deleted:new Set()};
            for(const id of ancestors){const e=accepted.get(id);if(e?.data.type==='edit'&&e.data.blip===d.parent)for(const op of e.data.ops)if(op.kind==='delete')for(const target of op.ids)view.deleted.add(target);}
            const visible=sequence(view).visible, start=visible.findIndex(e=>e.id===d.anchor.ids[0]);
            const span=visible.slice(start,start+d.anchor.ids.length);
            if(start<0||span.map(e=>e.id).join('|')!==d.anchor.ids.join('|')||span.map(e=>e.value).join('')!==d.anchor.quote)throw Error('Anchor does not match observed passage');
          }
          threads.set(r.id,{id:r.id,record:r,parent:d.parent,anchor:d.anchor});
        } else if(d.type==='blip') {
          if(!threads.has(d.thread)||!knows(d.thread))throw Error('Invalid thread');
          if(d.after!==null&&(!blips.has(d.after)||blips.get(d.after).thread!==d.thread||!knows(d.after)))throw Error('Invalid predecessor');
          const b={id:r.id,record:r,thread:d.thread,after:d.after,elements:new Map(),deleted:new Set(),history:[r]};
          insert(b,r,0,d.text,null,clock);blips.set(r.id,b);
        } else if(d.type==='edit') {
          const b=blips.get(d.blip);
          if(!b||!knows(d.blip))throw Error('Invalid blip');
          // Validate the entire event before mutation, including earlier operations in this event.
          const local=new Set(); let added=0;
          d.ops.forEach((op,i)=>{
            const valid=id=>owns(b,id)||local.has(id);
            if(op.kind==='insert') {
              if(op.after!==null&&!valid(op.after))throw Error('Invalid insertion anchor');
              Array.from(op.text).forEach((_,j)=>local.add(elementId(r.id,i,j)));added+=Array.from(op.text).length;
            }else if(!op.ids.every(valid))throw Error('Invalid deletion target');
          });
          if([...b.elements.values()].filter(e=>knows(e.event)).length+added>LIMITS.text)throw Error('Observed blip element limit exceeded');
          d.ops.forEach((op,i)=>{if(op.kind==='insert')insert(b,r,i,op.text,op.after,clock);else for(const id of op.ids)b.deleted.add(id);});
          b.history.push(r);
        }else throw Error('Unsupported Wave event');
        accepted.set(r.id,{...r,clock});ancestry.set(r.id,ancestors);
      }catch(e){rejected.set(r.id,e.message);}
      progress=true;return false;
    });
  }
  const referenced=new Set([...accepted.values()].flatMap(r=>r.data.deps||[]));
  const heads=[...accepted.keys()].filter(id=>!referenced.has(id)).sort();
  for(const b of blips.values())Object.assign(b,sequence(b));
  return {root,members:[...members],accepted,rejected,pending,threads,blips,heads};
}
export function orderedBlips(model,thread) {
  const children=new Map();
  for(const b of model.blips.values())if(b.thread===thread){const xs=children.get(b.after)||[];xs.push(b);children.set(b.after,xs);}
  for(const xs of children.values())xs.sort((a,b)=>compare(a.id,b.id));
  const result=[],stack=[...(children.get(null)||[])].reverse();
  while(stack.length){const b=stack.pop();result.push(b);const xs=children.get(b.id)||[];for(let i=xs.length-1;i>=0;i--)stack.push(xs[i]);}
  return result;
}
export function resolveAnchor(blip,anchor) {
  if(!anchor)return {status:'whole',start:blip.visible.length,end:blip.visible.length};
  const selected=new Set(anchor.ids), positions=[];
  blip.visible.forEach((e,i)=>{if(selected.has(e.id))positions.push(i);});
  if(!positions.length)return {status:'removed',start:blip.visible.length,end:blip.visible.length};
  return {status:positions.length===anchor.ids.length?'attached':'partial',start:positions[0],end:positions.at(-1)+1};
}
// One contiguous editor replacement, indexed in Unicode scalars, never UTF-16 halves.
export function editOps(blip,next) {
  const before=blip.visible, a=before.map(e=>e.value), b=Array.from(next);
  let start=0;while(start<a.length&&start<b.length&&a[start]===b[start])start++;
  let end=a.length,tail=b.length;while(end>start&&tail>start&&a[end-1]===b[tail-1]){end--;tail--;}
  const ops=[],ids=before.slice(start,end).map(e=>e.id);
  for(let i=0;i<ids.length;i+=700)ops.push({kind:'delete',ids:ids.slice(i,i+700)});
  const text=b.slice(start,tail).join('');
  if(text.length>LIMITS.run)throw Error(`Insert at most ${LIMITS.run} UTF-16 units per batch`);
  if(text)ops.push({kind:'insert',after:start?before[start-1].id:null,text});
  return ops;
}
export function selectionAnchor(blip,start,end) {
  // Browser selection offsets are UTF-16; require scalar boundaries.
  let offset=0;const ids=[];
  for(const e of blip.visible){const next=offset+e.value.length;if(offset>=start&&next<=end)ids.push(e.id);else if(offset<end&&next>start)throw Error('Selection splits a Unicode character');offset=next;}
  if(!ids.length)throw Error('Select a passage first');
  return {ids,quote:blip.visible.filter(e=>ids.includes(e.id)).map(e=>e.value).join('')};
}
export async function readBundle(bundle) {
  if(bundle?.format!=='anproto-wave/2'||!Array.isArray(bundle.records)||bundle.records.length>LIMITS.events||!bundle.images||typeof bundle.images!=='object'||Array.isArray(bundle.images))throw Error('Invalid v2 export');
  const records=await Promise.all(bundle.records.map(verify)),images={};
  if(records.some(r=>r.data.type==='presence'))throw Error('Presence is ephemeral');
  for(const [id,data]of Object.entries(bundle.images)) {
    if(!isHash(id)||!str(data,1000000)||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data)||await an.hash(data)!==id)throw Error('Invalid avatar image');
    images[id]=data;
  }
  return {records,images};
}
