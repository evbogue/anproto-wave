import {an,sign,verify,project,orderedBlips,resolveAnchor,selectionAnchor,editOps,readBundle,LIMITS} from './crdt.js';
import {visual} from './vendor/wiredove-render.js';
import * as store from './store-v2.js';
const $=id=>document.getElementById(id);
const el=(tag,attrs={},children=[])=>{const n=document.createElement(tag);Object.assign(n,attrs);n.append(...children);return n;};
const say=message=>$('notice').textContent=message;
const run=action=>async()=>{try{await action();}catch(e){say(e.message||'Could not complete action');}};
const button=(label,action)=>el('button',{type:'button',textContent:label,onclick:run(action)});
let records=[],images={},identities=store.keys(),active=identities[0]?.slice(0,44)||'',selected=decodeURIComponent(location.hash.slice(1)),model,session=null,online=true,syncing=false,revision='',outbox=0,drafts=[],queue=Promise.resolve(),presence=[],lastPresence=0,syncError='';
const cards=new Map(),threadViews=new Map();
function clearView(){cards.clear();threadViews.clear();$('root-compose')?.remove();}
const key=()=>identities.find(k=>k.slice(0,44)===active);
const serial=action=>{const result=queue.then(action);queue=result.catch(()=>{});return result;};
const raw=r=>({content:r.content,message:r.message});
function profile(pubkey){return records.filter(r=>r.author===pubkey&&r.data.type==='profile').sort((a,b)=>a.time-b.time||(a.id<b.id?-1:1)).at(-1)?.data||{name:pubkey.slice(0,10),image:null};}
function avatar(pubkey){const img=visual(pubkey),fallback=img.src;img.className='avatar';img.alt=profile(pubkey).name+' avatar';img.onerror=()=>{img.onerror=null;img.src=fallback;};if(images[profile(pubkey).image])img.src=images[profile(pubkey).image];return img;}
function person(pubkey){return el('span',{className:'person',title:pubkey},[avatar(pubkey),el('span',{textContent:profile(pubkey).name})]);}
function status(text){$('connection').textContent=text||`${online?'Connected to local relay':'Offline'} · ${session?.dirty?'Unsaved typing':outbox?`${outbox} change(s) saved locally, awaiting relay`:'Synced to local relay'}`;}
function rebuild(){model=project(records,selected);}
async function persist(record,media={},draftId=null){const r=await verify(record);await store.save([r],media,true,draftId);records=[...new Map([...records,r].map(x=>[x.id,x])).values()];Object.assign(images,media);outbox++;rebuild();return r;}
async function event(data,signingKey=key(),draftId=null){
  if(!signingKey)throw Error('Create an identity first');
  const record=await sign(data,signingKey),r=await verify(record);
  if(data.wave&&data.type!=='presence'){const trial=project([...records,r],data.wave);if(!trial||trial.rejected.has(r.id)||!trial.accepted.has(r.id))throw Error(trial?.rejected.get(r.id)||'Local event has missing dependencies');}
  return persist(record,{},draftId);
}
function causal(){if(!model)throw Error('Open a Wave first');if(model.heads.length>LIMITS.deps)throw Error('Too many concurrent branches for this prototype');return {wave:selected,deps:[...model.heads]};}
function caret(field,base){const point=offset=>{let units=0,left=null;for(const e of base.visible){if(units+e.value.length>offset)break;units+=e.value.length;left=e.id;}return {left,offset};};return [point(field.selectionStart),point(field.selectionEnd),field.selectionDirection];}
function restoreCaret(field,points,before,after){const locate=p=>{if(p.left===null)return 0;let target=p.left;const all=before.all||before.visible;let i=all.findIndex(e=>e.id===target);while(i>=0&&!after.visible.some(e=>e.id===target))target=all[--i]?.id;let units=0;for(const e of after.visible){units+=e.value.length;if(e.id===target)return units;}return 0;};field.setSelectionRange(locate(points[0]),locate(points[1]),points[2]);}
function boundedOps(wave,deps,blip,ops){
  const batch=[];
  for(const op of ops){if(batch.length>=LIMITS.ops||new TextEncoder().encode(JSON.stringify({version:2,type:'edit',wave,deps,blip,ops:[...batch,op]})).length>60000)break;batch.push(op);}
  if(!batch.length)throw Error('Edit batch exceeds the protocol limit');return batch;
}
async function flush() {
  if(!session)return;
  const s=session;
  clearTimeout(s.timer);
  while(s===session&&s.field.value!==s.base.text){
    if(s.composing)return;
    const next=s.field.value;
    const draft={id:s.id,wave:s.wave,blip:s.id,author:s.author,text:next,base:s.base.visible.map(e=>({id:e.id,value:e.value})),deps:s.deps};
    await store.saveDraft(draft);
    const ops=editOps(s.base,next);if(!ops.length)break;
    const batch=boundedOps(s.wave,s.deps,s.id,ops);
    const r=await event({type:'edit',wave:s.wave,deps:s.deps,blip:s.id,ops:batch},s.key,batch.length===ops.length?s.id:null);
    const m=project(records,s.wave);if(m.rejected.has(r.id))throw Error(m.rejected.get(r.id));
    s.base=m.blips.get(s.id);s.deps=m.heads;
  }
  s.dirty=false;status();
}
async function finish(){await serial(flush);if(session){session=null;render();}void sync();}
function startEdit(b){return serial(async()=>{
  await flush();session=null;render();b=model.blips.get(b.id);
  const field=el('textarea',{value:b.text,maxLength:LIMITS.text,ariaLabel:'Edit shared text'});
  session={id:b.id,wave:selected,author:active,key:key(),field,base:b,deps:[...model.heads],dirty:false,timer:null,composing:false};
  const s=session;
  field.oncompositionstart=()=>{s.composing=true;clearTimeout(s.timer);};
  field.oncompositionend=()=>{s.composing=false;field.oninput();};
  field.oninput=()=>{s.dirty=true;status();clearTimeout(s.timer);if(!s.composing)s.timer=setTimeout(()=>{serial(flush).then(()=>{render();void sync();}).catch(e=>say(e.message));},250);};
  render();field.focus();
});}
function compose(slot,thread,after=null,anchor=null,parent=null,anchorDeps=null){
  const field=el('textarea',{maxLength:LIMITS.run,ariaLabel:anchor?'Reply to passage':'New message'});
  slot.replaceChildren(...(anchor?[el('blockquote',{textContent:anchor.quote})]:[]),field,button('Add message',()=>serial(async()=>{
    await flush();if(!field.value.trim())throw Error('Write something first');
    let target=thread;
    if(!target){const t=await event({type:'thread',wave:selected,deps:anchorDeps||causal().deps,parent,anchor});target=t.id;}
    await event({type:'blip',...causal(),thread:target,after,text:field.value});slot.replaceChildren();render();void sync();
  })),button('Close',()=>slot.replaceChildren()));field.focus();
}
function capturePassage(p,b){const selection=window.getSelection();if(!selection||selection.isCollapsed||!p.contains(selection.anchorNode)||!p.contains(selection.focusNode))return null;const range=selection.getRangeAt(0),prefix=range.cloneRange();prefix.selectNodeContents(p);prefix.setEnd(range.startContainer,range.startOffset);const start=Number(p.dataset.offset)+prefix.toString().length;return selectionAnchor(b,start,start+range.toString().length);}
function renderBlip(b,depth=0){
  let c=cards.get(b.id);
  if(!c){const node=el('article',{className:'blip',id:'blip-'+b.id}),header=el('div',{className:'toolbar'}),body=el('div'),controls=el('div',{className:'toolbar'}),slot=el('div'),history=el('details');node.append(header,body,controls,slot,history);c={node,header,body,controls,slot,history,stamp:''};cards.set(b.id,c);}
  c.header.replaceChildren(person(b.record.author),el('span',{className:'message-meta',textContent:'shared message'}));
  const canWrite=model.members.includes(active),editing=session?.id===b.id;
  if(editing){if(!c.body.contains(session.field))c.body.replaceChildren(el('p',{className:'message-meta',textContent:'Edits share while typing · Done closes the editor'}),session.field);c.controls.replaceChildren(button('Done',finish));}
  else {
    const childThreads=[...model.threads.values()].filter(t=>t.parent===b.id).sort((a,b)=>a.id<b.id?-1:1);
    const stamp=(session?.id||'')+records.map(r=>r.id).join('|')+b.text+childThreads.map(t=>t.id+resolveAnchor(b,t.anchor).status+[...model.blips.values()].filter(x=>x.thread===t.id).map(x=>x.id+x.text).join('')).join('');
    // Text is rebuilt only when its content or inline threads change. Composer slots survive sync.
    if(c.stamp!==stamp||c.body.querySelector('textarea')) {
      c.stamp=stamp;const parts=[],points=childThreads.map(t=>({t,position:resolveAnchor(b,t.anchor)})).sort((a,b)=>a.position.end-b.position.end||(a.t.id<b.t.id?-1:1));let offset=0;
      const addText=end=>{const value=b.visible.slice(offset,end).map(e=>e.value).join(''),p=el('p',{className:'wave-text',textContent:value||' '});p.dataset.offset=b.visible.slice(0,offset).map(e=>e.value).join('').length;p.onmouseup=()=>{try{c.anchor=capturePassage(p,b);c.anchorDeps=[...model.heads];}catch(e){say(e.message);}};parts.push(p);offset=end;};
      for(const {t,position}of points){if(position.end>offset)addText(position.end);let view=threadViews.get(t.id);if(!view){view={detail:el('details',{className:'reply-group',open:true}),summary:el('summary'),slot:el('div')};threadViews.set(t.id,view);}view.summary.textContent=t.anchor?`${position.status==='removed'?'Passage removed · ':position.status==='partial'?'Passage partly removed · ':''}“${t.anchor.quote}”`:'Replies';const children=[view.summary];if(depth<50)for(const child of orderedBlips(model,t.id))children.push(renderBlip(child,depth+1));if(canWrite)children.push(button('Continue thread',()=>compose(view.slot,t.id,orderedBlips(model,t.id).at(-1)?.id||null)),view.slot);view.detail.replaceChildren(...children);parts.push(view.detail);}
      if(offset<b.visible.length||!parts.length)addText(b.visible.length);c.body.replaceChildren(...parts);
    }
    c.controls.replaceChildren(...(canWrite?[button('Edit',()=>startEdit(b)),button('Reply',()=>compose(c.slot,null,null,null,b.id)),button('Reply here',()=>{if(!c.anchor)throw Error('Select text within a passage first');compose(c.slot,null,null,c.anchor,b.id,c.anchorDeps);})]:[]));
  }
  c.history.replaceChildren(el('summary',{textContent:`History · ${b.history.length} signed contribution(s)`}));
  for(const r of b.history)c.history.append(el('p',{className:'message-meta',textContent:`${profile(r.author).name} · ${r.data.type==='blip'?'created':r.data.ops.map(o=>o.kind==='insert'?`inserted ${Array.from(o.text).length} character(s)`:`deleted ${o.ids.length} character(s)`).join(', ')} · signature verified · ${new Date(r.time).toLocaleString()}`}));
  return c.node;
}
function render(){
  rebuild();const scroll=window.scrollY,focus=document.activeElement,selection=focus?.tagName==='TEXTAREA'?[focus.selectionStart,focus.selectionEnd,focus.selectionDirection]:null;
  const roots=records.filter(r=>r.data.type==='wave').sort((a,b)=>a.id<b.id?-1:1);
  if(!selected&&roots.length){selected=roots[0].id;rebuild();}
  $('identity').replaceChildren(...identities.map(k=>el('option',{value:k.slice(0,44),textContent:profile(k.slice(0,44)).name})));$('identity').value=active;
  $('notebooks').replaceChildren(...roots.map(r=>button(r.data.title,async()=>{await finish();selected=r.id;location.hash=encodeURIComponent(selected);clearView();render();})));$('export').disabled=!model;
  const area=$('wave');
  if(!model){area.replaceChildren(el('section',{className:'message'},[el('h2',{textContent:selected?'Waiting for this Wave…':'Start a conversation'}),el('p',{textContent:'Create a Wave with another person’s public key, then send them its share link. Open the link in a browser using the same local relay.'})]));return;}
  const content=[el('header',{className:'message'},[el('h2',{textContent:model.root.data.title}),el('p',{id:'activity',className:'message-meta',textContent:presence.filter(p=>p.wave===selected&&p.author!==active).map(p=>profile(p.author).name+' is editing…').join(' · ')}),el('div',{className:'participants'},model.members.map(person)),el('p',{className:'message-meta',textContent:model.members.includes(active)?'All participants can edit. Select a passage to reply in context.':'Read-only: this identity is not a participant.'}),button('Copy share link',async()=>{const url=location.origin+'/#'+encodeURIComponent(selected);await navigator.clipboard.writeText(url);say('Share link copied. This relay is local to this computer.');})])];
  for(const t of [...model.threads.values()].filter(t=>t.parent===null).sort((a,b)=>a.id<b.id?-1:1))for(const b of orderedBlips(model,t.id))content.push(renderBlip(b));
  if(model.members.includes(active)){let composeBox=$('root-compose');if(!composeBox){const slot=el('div');composeBox=el('section',{className:'message',id:'root-compose'},[button('Add message',()=>{const t=[...model.threads.values()].find(t=>t.parent===null);compose(slot,t?.id||null,t?orderedBlips(model,t.id).at(-1)?.id||null:null);}),slot]);}content.push(composeBox);}
  if(model.pending.length||model.rejected.size)content.push(el('p',{className:'message-meta',textContent:`${model.pending.length} pending dependency record(s) · ${model.rejected.size} rejected record(s)`}));
  for(const d of drafts.filter(d=>d.wave===selected))content.push(el('section',{className:'message'},[el('p',{textContent:'Recovered unsent typing. Review before applying.'}),el('pre',{className:'wave-text',textContent:d.text}),button('Apply recovered edit',()=>serial(async()=>{const base={visible:d.base},recoveredKey=identities.find(k=>k.slice(0,44)===d.author);if(!recoveredKey)throw Error('The recovered draft’s signing identity is missing');let ops=editOps(base,d.text),deps=d.deps;while(ops.length){const batch=boundedOps(d.wave,deps,d.blip,ops),r=await event({type:'edit',wave:d.wave,deps,blip:d.blip,ops:batch},recoveredKey,batch.length===ops.length?d.id:null);ops=ops.slice(batch.length);deps=[r.id];}await store.removeDraft(d.id);drafts=drafts.filter(x=>x.id!==d.id);render();})),button('Discard recovered draft',async()=>{await store.removeDraft(d.id);drafts=drafts.filter(x=>x.id!==d.id);render();})]));
  area.replaceChildren(...content);if(focus?.isConnected){focus.focus({preventScroll:true});if(selection)focus.setSelectionRange(...selection);}window.scrollTo({top:scroll,behavior:'instant'});
}
async function sync(){
  if(!online||syncing)return;syncing=true;
  try{
    await serial(async()=>{
      if(session?.composing)return;
      await flush();let saved=await store.load();outbox=saved.outbox.length;
      if(saved.outbox.length){const response=await fetch('/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({format:'anproto-wave/2',records:saved.outbox.map(raw),images:Object.fromEntries(saved.images.map(x=>[x.id,x.data]))})});const result=await response.json();if(!response.ok)throw Error(result.error);await store.ack(result.ids);outbox=(await store.load()).outbox.length;}
      const response=await fetch('/sync?revision='+encodeURIComponent(revision));if(!response.ok)throw Error('Relay unavailable');const bundle=await response.json();
      if(bundle.records){const checked=await readBundle(bundle);await store.save(checked.records,checked.images);if(session?.composing)return;await flush();if(session?.composing)return;const old=session?.base,points=session?caret(session.field,old):null;records=[...new Map([...records,...checked.records].map(r=>[r.id,r])).values()];Object.assign(images,checked.images);rebuild();if(session){const after=model.blips.get(session.id);session.base=after;session.deps=model.heads;session.field.value=after.text;restoreCaret(session.field,points,old,after);}revision=bundle.revision;render();}
      if((bundle.presence||[]).length>256)throw Error('Presence inventory too large');
      presence=(await Promise.all((bundle.presence||[]).map(async p=>{const r=await verify(p);if(r.data.type!=='presence'||r.data.wave!==selected||!model?.members.includes(r.author)||!model.blips.has(r.data.blip)||r.time+10000<Date.now()||r.time>Date.now()+10000)return null;return {author:r.author,wave:r.data.wave,blip:r.data.blip,expires:r.time+10000};}))).filter(Boolean);
      if(session&&Date.now()-lastPresence>2000){lastPresence=Date.now();await fetch('/presence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(await sign({type:'presence',wave:session.wave,blip:session.id},session.key))});}
      const activity=$('activity');if(activity)activity.textContent=presence.filter(p=>p.wave===selected&&p.author!==active&&p.expires>Date.now()).map(p=>profile(p.author).name+' is editing…').join(' · ');
      if($('notice').textContent===syncError)say('');syncError='';status();
    });
  }catch(e){status(session?.dirty?'Typing is unsynced · Check the error below':'Relay unavailable · Saved changes remain local');syncError=e.message;say(syncError);}finally{syncing=false;}
}
$('network').onclick=run(async()=>{await serial(flush);online=!online;$('network').textContent=online?'Work offline':'Reconnect';status();if(online)void sync();});
$('identity').onchange=run(async()=>{const chosen=$('identity').value;await finish();active=chosen;render();});
$('add-person').onclick=run(async()=>{await finish();const k=await an.gen();store.addKey(k);identities=store.keys();active=k.slice(0,44);render();openProfile();});
$('create').onclick=run(()=>{const title=el('input',{ariaLabel:'Wave title',placeholder:'Wave title',maxLength:150}),participants=el('textarea',{ariaLabel:'Participant public keys',placeholder:'Other participants’ public keys, one per line'});$('new-wave').replaceChildren(title,participants,button('Create Wave',()=>serial(async()=>{await flush();session=null;const r=await event({type:'wave',title:title.value.trim(),participants:participants.value.split(/\s+/).filter(Boolean)});selected=r.id;location.hash=encodeURIComponent(selected);$('new-wave').replaceChildren();clearView();render();void sync();})),button('Close',()=>$('new-wave').replaceChildren()));title.focus();});
function openProfile(){
  const owner=active,signingKey=key(),current=profile(owner),photo=avatar(owner),name=el('input',{value:current.name,maxLength:100,ariaLabel:'Display name'}),file=el('input',{type:'file',accept:'image/*',ariaLabel:'Choose avatar image'});let imageHash=current.image,imageData=images[imageHash],processing=false;
  photo.className='profile-photo';const submit=button('Save profile',()=>serial(async()=>{if(processing)throw Error('Wait for the photo to finish');const r=await sign({type:'profile',name:name.value.trim(),image:imageHash},signingKey);await persist(r,imageHash?{[imageHash]:imageData}:{});$('profile').replaceChildren();render();void sync();}));
  file.onchange=run(async()=>{const chosen=file.files[0];if(!chosen)return;if(chosen.size>10000000)throw Error('Choose an image smaller than 10 MB');processing=true;submit.disabled=true;try{const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(chosen);});const img=new Image();img.src=src;await img.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const side=Math.min(img.width,img.height);canvas.getContext('2d').drawImage(img,Math.floor((img.width-side)/2),Math.floor((img.height-side)/2),side,side,0,0,256,256);imageData=canvas.toDataURL();imageHash=await an.hash(imageData);photo.src=imageData;}finally{processing=false;submit.disabled=false;}});
  $('profile').replaceChildren(el('section',{className:'message'},[photo,el('p',{className:'message-meta',textContent:'Self-asserted display name · Public key to share with a participant'}),el('p',{className:'wave-text',textContent:owner}),name,file,button('Use generated avatar',()=>{imageHash=null;imageData=null;photo.src=visual(owner).src;}),submit,button('Close',()=>$('profile').replaceChildren())]));
}
$('profile-button').onclick=run(openProfile);
$('export').onclick=run(async()=>{await serial(flush);const members=new Set(model.members),exported=records.filter(r=>r.id===selected||r.data.wave===selected||(r.data.type==='profile'&&members.has(r.author))),used=new Set(exported.filter(r=>r.data.type==='profile').map(r=>r.data.image));$('transfer').hidden=false;$('bundle').value=JSON.stringify({format:'anproto-wave/2',records:exported.map(raw),images:Object.fromEntries(Object.entries(images).filter(([id])=>used.has(id)))},null,2);say('Public export ready. No private keys included.');});
$('import').onclick=()=>{$('transfer').hidden=false;$('bundle').value='';};
$('close-transfer').onclick=()=>{$('transfer').hidden=true;};
$('choose-file').onclick=()=>$('import-file').click();
async function importBundle(value){if(value.length>20*1024*1024)throw Error('Export too large');const checked=await readBundle(JSON.parse(value));await serial(async()=>{await flush();const combined=[...records,...checked.records],incoming=new Set(checked.records.map(r=>r.id));for(const root of combined.filter(r=>r.data.type==='wave')){const trial=project(combined,root.id);for(const [id,reason]of trial.rejected)if(incoming.has(id))throw Error('Import rejected: '+reason);}for(const r of checked.records)await persist(r,checked.images);selected=checked.records.find(r=>r.data.type==='wave')?.id||selected;render();});$('transfer').hidden=true;void sync();}
$('import-text').onclick=run(()=>importBundle($('bundle').value));
$('import-file').onchange=run(async()=>{const file=$('import-file').files[0];if(file){if(file.size>20*1024*1024)throw Error('Export too large');await importBundle(await file.text());}});
window.addEventListener('beforeunload',e=>{if(session?.dirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('hashchange',run(async()=>{const id=decodeURIComponent(location.hash.slice(1));if(id!==selected){await finish();selected=id;clearView();render();}}));
async function init(){const saved=await store.load();records=await Promise.all(saved.records.map(verify));images=Object.fromEntries(saved.images.map(x=>[x.id,x.data]));outbox=saved.outbox.length;drafts=saved.drafts;if(!identities.length){const k=await an.gen();store.addKey(k);identities=store.keys();active=k.slice(0,44);}render();await sync();setInterval(()=>void sync(),500);}
init().catch(e=>say('Could not load local data: '+e.message));
