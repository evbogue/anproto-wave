import {test} from 'node:test';
import assert from 'node:assert/strict';
import {an,sign,verify,project,editOps,selectionAnchor,resolveAnchor,elementId,orderedBlips,readBundle} from './crdt.js';
import {referenceText} from './reference-crdt.js';
import nacl from './vendor/lib/nacl-fast-es.js';
nacl.setPRNG((b,n)=>crypto.getRandomValues(b.subarray(0,n)));
async function fixture(text='abc 🌊') {
  const a=await an.gen(),b=await an.gen(),outsider=await an.gen();
  const make=async(d,key=a)=>verify(await sign(d,key));
  const root=await make({type:'wave',title:'Workshop',participants:[b.slice(0,44)]}),wave=root.id;
  const thread=await make({type:'thread',wave,deps:[wave],parent:null,anchor:null});
  const blip=await make({type:'blip',wave,deps:[thread.id],thread:thread.id,after:null,text});
  const records=[root,thread,blip];
  return {a,b,outsider,make,wave,thread,blip,records,model:()=>project(records,wave)};
}
function* permutations(xs){if(xs.length===0){yield [];return;}for(let i=0;i<xs.length;i++)for(const rest of permutations(xs.filter((_,j)=>i!==j)))yield [xs[i],...rest];}
test('every permutation converges, preserves insertion runs, Unicode and duplicates',async()=>{
  const f=await fixture('ab');const b=f.model().blips.get(f.blip.id),after=b.visible[0].id;
  const left=await f.make({type:'edit',wave:f.wave,deps:[f.blip.id],blip:f.blip.id,ops:[{kind:'insert',after,text:'XY🌊'}]});
  const right=await f.make({type:'edit',wave:f.wave,deps:[f.blip.id],blip:f.blip.id,ops:[{kind:'insert',after,text:'PQ'}]},f.b);
  let expected;
  for(const order of permutations([...f.records,left,right])){const m=project([...order,left],f.wave),b=m.blips.get(f.blip.id);expected??=b.text;assert.equal(b.text,expected);assert.equal(b.text,referenceText(order,f.blip.id));assert.equal(m.rejected.size,0);assert.equal(m.pending.length,0);}
  assert.match(expected,/^a(?:XY🌊PQ|PQXY🌊)b$/);
});
test('ordinary insertion at cursor stays in order and edits use scalar boundaries',async()=>{
  const f=await fixture('hello 🌊');
  for(const next of ['hello 🌊!','hello brave 🌊!','Xhello brave 🌊!','Xhello brave !']){const b=f.model().blips.get(f.blip.id);f.records.push(await f.make({type:'edit',wave:f.wave,deps:f.model().heads,blip:b.id,ops:editOps(b,next)}));assert.equal(f.model().blips.get(b.id).text,next);}
  assert.throws(()=>selectionAnchor(f.model().blips.get(f.blip.id),100,101));
});
test('overlapping deletes are monotonic; unseen insertions survive; offline edits converge',async()=>{
  const f=await fixture('abcd'),b=f.model().blips.get(f.blip.id),ids=b.visible.map(e=>e.id);
  const edits=await Promise.all([
    f.make({type:'edit',wave:f.wave,deps:[b.id],blip:b.id,ops:[{kind:'delete',ids:ids.slice(1,3)}]}),
    f.make({type:'edit',wave:f.wave,deps:[b.id],blip:b.id,ops:[{kind:'delete',ids:ids.slice(2,4)}]},f.b),
    f.make({type:'edit',wave:f.wave,deps:[b.id],blip:b.id,ops:[{kind:'insert',after:ids[1],text:'OFFLINE'}]},f.b)
  ]);
  for(const order of permutations(edits)){const m=project([...order,...f.records],f.wave);assert.equal(m.blips.get(b.id).text,'aOFFLINE');assert.equal(m.blips.get(b.id).text,referenceText([...f.records,...order],b.id));}
});
test('passage anchors exclude edge inserts, include interior edits and retain deleted quotes',async()=>{
  const f=await fixture('one two three'),b=f.model().blips.get(f.blip.id),anchor=selectionAnchor(b,4,7);
  const thread=await f.make({type:'thread',wave:f.wave,deps:[b.id],parent:b.id,anchor},f.b);f.records.push(thread);
  const edit=await f.make({type:'edit',wave:f.wave,deps:[b.id],blip:b.id,ops:[{kind:'insert',after:b.visible[3].id,text:'BEFORE '},{kind:'insert',after:b.visible[6].id,text:' AFTER'},{kind:'insert',after:b.visible[4].id,text:'!'}]});
  f.records.push(edit);let model=f.model(),current=model.blips.get(b.id),resolved=resolveAnchor(current,anchor);
  assert.equal(current.visible.slice(resolved.start,resolved.end).map(e=>e.value).join(''),'t!wo');assert.equal(model.rejected.size,0);
  f.records.push(await f.make({type:'edit',wave:f.wave,deps:model.heads,blip:b.id,ops:[{kind:'delete',ids:[anchor.ids[0]]}]}));
  assert.equal(resolveAnchor(f.model().blips.get(b.id),anchor).status,'partial');
  f.records.push(await f.make({type:'edit',wave:f.wave,deps:f.model().heads,blip:b.id,ops:[{kind:'delete',ids:anchor.ids}]}));
  assert.equal(resolveAnchor(f.model().blips.get(b.id),anchor).status,'removed');assert.equal(f.model().threads.get(thread.id).anchor.quote,'two');
});
test('missing causal dependencies remain pending; invalid ownership and nonmembers are rejected atomically',async()=>{
  const f=await fixture('abc'),b=f.model().blips.get(f.blip.id);
  const edit=await f.make({type:'edit',wave:f.wave,deps:[b.id],blip:b.id,ops:[{kind:'insert',after:null,text:'good'}]});
  assert.equal(project([f.records[0],edit],f.wave).pending.length,1);
  const bad=await f.make({type:'edit',wave:f.wave,deps:[b.id],blip:b.id,ops:[{kind:'insert',after:null,text:'should not appear'},{kind:'delete',ids:[elementId(f.wave,0,0)]}]});
  const stranger=await f.make({type:'edit',wave:f.wave,deps:[b.id],blip:b.id,ops:[{kind:'delete',ids:[b.visible[0].id]}]},f.outsider);
  const m=project([...f.records,bad,stranger],f.wave);assert.equal(m.rejected.size,2);assert.equal(m.blips.get(b.id).text,'abc');
  const quote=await f.make({type:'thread',wave:f.wave,deps:[b.id],parent:b.id,anchor:{ids:[b.visible[0].id],quote:'wrong'}});
  assert.equal(project([...f.records,quote],f.wave).rejected.size,1);
});
test('signed exports verify original bytes and reject versions, oversized payloads and malformed Unicode',async()=>{
  const f=await fixture();const raw=f.records.map(({content,message})=>({content,message}));
  assert.equal((await readBundle({format:'anproto-wave/2',records:raw,images:{}})).records.length,3);
  await assert.rejects(()=>verify({...raw[0],content:raw[0].content.replace('Workshop','Impostor')}));
  await assert.rejects(()=>f.make({type:'blip',wave:f.wave,deps:[f.thread.id],thread:f.thread.id,after:null,text:'\ud800'}));
  await assert.rejects(()=>f.make({version:3,type:'wave',title:'bad',participants:[]}));
  await assert.rejects(()=>verify({content:' '.repeat(65537),message:raw[0].message}));
});
test('concurrent conversation continuations use deterministic predecessor ordering',async()=>{
  const f=await fixture();const next=await f.make({type:'blip',wave:f.wave,deps:[f.blip.id],thread:f.thread.id,after:f.blip.id,text:'next'}),other=await f.make({type:'blip',wave:f.wave,deps:[f.blip.id],thread:f.thread.id,after:f.blip.id,text:'other'},f.b);
  const a=orderedBlips(project([...f.records,next,other],f.wave),f.thread.id).map(b=>b.id),b=orderedBlips(project([other,next,...f.records].reverse(),f.wave),f.thread.id).map(b=>b.id);assert.deepEqual(a,b);assert.equal(a[0],f.blip.id);
});

test('cross-Wave references, unobserved targets, and dependency cycles never apply',async()=>{
  const f=await fixture(),g=await fixture(),b=f.model().blips.get(f.blip.id);
  const other=await f.make({type:'edit',wave:f.wave,deps:[g.blip.id],blip:b.id,ops:[{kind:'insert',after:null,text:'bad'}]});
  assert.equal(project([...f.records,...g.records,other],f.wave).rejected.size,1);
  const unobserved=await f.make({type:'edit',wave:f.wave,deps:[f.thread.id],blip:b.id,ops:[{kind:'insert',after:null,text:'bad'}]});
  assert.equal(project([...f.records,unobserved],f.wave).rejected.size,1);
  // Cycles cannot be constructed from real content-derived event IDs without a
  // hash fixed point; self/missing references stay pending and cannot mutate text.
  const missing=await f.make({type:'edit',wave:f.wave,deps:[await an.hash('missing')],blip:b.id,ops:[{kind:'insert',after:null,text:'bad'}]});
  assert.equal(project([...f.records,missing],f.wave).pending.length,1);
});

test('unknown fields and operation extensions require explicit protocol versioning',async()=>{
  const f=await fixture();
  await assert.rejects(()=>f.make({type:'wave',title:'bad',participants:[],wave:f.wave}));
  await assert.rejects(()=>f.make({type:'edit',wave:f.wave,deps:[f.blip.id],blip:f.blip.id,ops:[{kind:'insert',after:null,text:'bad',surprise:true}]}));
});
