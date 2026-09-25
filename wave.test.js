import { test } from 'node:test';
import assert from 'node:assert/strict';
import { an, sign, verify, project, readBundle } from './wave.js';
import nacl from './vendor/lib/nacl-fast-es.js';
// The copied browser library initializes from window.crypto; supply the same
// secure randomness in Node without modifying its source.
nacl.setPRNG((bytes, length) => crypto.getRandomValues(bytes.subarray(0,length)));
test('two authors converge despite reverse arrival, preserve conflicts, and resolve them', async()=>{
  const a=await an.gen(),b=await an.gen(), stranger=await an.gen();
  const make=async(d,k=a)=>verify(await sign({version:1,...d},k));
  const root=await make({type:'wave',title:'Test',participants:[b.slice(0,44)]});
  const wave=root.id;
  const block=await make({type:'wave/block',wave,replyTo:null,text:'original'});
  const reply=await make({type:'wave/block',wave,replyTo:block.id,text:'reply'},b);
  const left=await make({type:'wave/revise',wave,block:block.id,replaces:[block.id],text:'left'});
  const right=await make({type:'wave/revise',wave,block:block.id,replaces:[block.id],text:'right'},b);
  const unauthorized=await make({type:'wave/revise',wave,block:block.id,replaces:[left.id,right.id],text:'intrusion'},stranger);
  const all=[root,block,reply,left,right,unauthorized];
  assert.deepEqual(project(all,wave).heads(block.id).map(r=>r.id),project([...all].reverse(),wave).heads(block.id).map(r=>r.id));
  assert.equal(project(all,wave).heads(block.id).length,2);
  const resolved=await make({type:'wave/revise',wave,block:block.id,replaces:[left.id,right.id],text:'combined'});
  const result=project([resolved,...all].reverse(),wave);
  assert.equal(result.heads(block.id)[0].data.text,'combined');
  assert.equal(result.versions(block.id).length,4);
  assert.equal(result.blocks.length,2);
  assert.equal(project([root,left],wave).waiting.length,1);
  const wrongTarget=await make({type:'wave/revise',wave,block:reply.id,replaces:[block.id],text:'bad'});
  assert.equal(project([...all,wrongTarget],wave).heads(reply.id)[0].id,reply.id);
});
test('signed content tampering and corrupt image imports are rejected', async()=>{
  const key=await an.gen();
  const record=await sign({type:'profile',version:1,name:'Alex',image:null},key);
  await assert.rejects(()=>verify({...record,content:record.content.replace('Alex','Evil')}));
  const image='data:image/png;base64,YQ==',id=await an.hash(image);
  const valid=await readBundle({format:'anproto-wave/1',records:[record],images:{[id]:image}});
  assert.equal(valid.records.length,1);
  await assert.rejects(()=>readBundle({format:'anproto-wave/1',records:[record],images:{[id]:image+'A'}}));
});
