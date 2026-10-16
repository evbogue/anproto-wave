import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRelay} from './server.js';
import {an,sign,verify,project} from './crdt.js';
import nacl from './vendor/lib/nacl-fast-es.js';
nacl.setPRNG((b,n)=>crypto.getRandomValues(b.subarray(0,n)));
test('relay acknowledges durable records, catches up after restart, rejects outsiders and hides storage',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'wave-relay-'));let server=await createRelay({directory,port:0});
  try {
    let origin=`http://127.0.0.1:${server.address().port}`;
    const post=async(bundle,path='/sync',otherOrigin=origin)=>fetch(origin+path,{method:'POST',headers:{origin:otherOrigin,'Content-Type':'application/json'},body:JSON.stringify(bundle)});
    const key=await an.gen(),stranger=await an.gen(),root=await verify(await sign({type:'wave',title:'Durable',participants:[]},key)),wave=root.id;
    const thread=await verify(await sign({type:'thread',wave,deps:[wave],parent:null,anchor:null},key));
    const blip=await verify(await sign({type:'blip',wave,deps:[thread.id],thread:thread.id,after:null,text:'hello'},key));
    const bundle=records=>({format:'anproto-wave/2',records,images:{}});
    assert.equal((await post(bundle([blip,thread,root]))).status,200);
    const duplicate=await post(bundle([root]));assert.equal(duplicate.status,200);
    const denied=await sign({type:'edit',wave,deps:[blip.id],blip:blip.id,ops:[{kind:'insert',after:null,text:'evil'}]},stranger);
    assert.equal((await post(bundle([denied]))).status,400);
    assert.equal((await post(bundle([]),'/sync','https://evil.example')).status,403);
    assert.equal((await fetch(origin+'/.wave-data/records.json')).status,404);
    assert.equal((await fetch(origin+'/store-v2.js')).status,200);
    assert.equal((await fetch(origin+'/README.md')).status,404);
    const p=await sign({type:'presence',wave,blip:blip.id},key);assert.equal((await post(p,'/presence')).status,200);
    assert.equal((await (await fetch(origin+'/sync')).json()).presence.length,1);
    await new Promise(resolve=>server.close(resolve));server=await createRelay({directory,port:0});origin=`http://127.0.0.1:${server.address().port}`;
    const stored=await(await fetch(origin+'/sync')).json();assert.equal(stored.records.length,3);assert.equal(stored.presence.length,0);
    const checked=await Promise.all(stored.records.map(verify));assert.equal(project(checked,wave).blips.get(blip.id).text,'hello');
    assert.ok(!JSON.stringify(stored).includes(key));
  }finally{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});}
});
test('an invalid orphan cannot prevent arrival of its valid Wave root',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'wave-orphan-')),server=await createRelay({directory,port:0});
  try{
    const origin=`http://127.0.0.1:${server.address().port}`,a=await an.gen(),b=await an.gen();
    const root=await verify(await sign({type:'wave',title:'Unblocked',participants:[]},a));
    const orphan=await sign({type:'thread',wave:root.id,deps:[root.id],parent:null,anchor:null},b);
    const post=records=>fetch(origin+'/sync',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({format:'anproto-wave/2',records,images:{}})});
    assert.equal((await post([orphan])).status,200);assert.equal((await post([root])).status,200);
    const bundle=await(await fetch(origin+'/sync')).json(),records=await Promise.all(bundle.records.map(verify)),model=project(records,root.id);
    assert.equal(model.accepted.size,1);assert.equal(model.rejected.size,1);
  }finally{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});}
});
