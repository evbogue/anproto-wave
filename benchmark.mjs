import {performance} from 'node:perf_hooks';
import {an,sign,verify,project} from './crdt.js';
import nacl from './vendor/lib/nacl-fast-es.js';
nacl.setPRNG((b,n)=>crypto.getRandomValues(b.subarray(0,n)));
const key=await an.gen(),make=async d=>verify(await sign(d,key));
const root=await make({type:'wave',title:'Benchmark',participants:[]}),wave=root.id,thread=await make({type:'thread',wave,deps:[wave],parent:null,anchor:null}),blip=await make({type:'blip',wave,deps:[thread.id],thread:thread.id,after:null,text:''}),records=[root,thread,blip];
let last=blip.id,after=null;
for(let i=0;i<500;i++){const r=await make({type:'edit',wave,deps:[last],blip:blip.id,ops:[{kind:'insert',after,text:'workshop 🌊 '}]});records.push(r);last=r.id;after=`${r.id}:0:10`;}
const times=[];let model;
for(let i=0;i<5;i++){const start=performance.now();model=project([...records].reverse(),wave);times.push(performance.now()-start);}
if(model.rejected.size||model.pending.length)throw Error('Invalid benchmark');
console.log(JSON.stringify({events:records.length,bytes:Buffer.byteLength(JSON.stringify(records.map(({content,message})=>({content,message})))),visibleScalars:model.blips.get(blip.id).visible.length,replayMilliseconds:times.map(x=>Math.round(x*10)/10),target:'500 edits, 5500 scalars, replay under 250 ms; loopback display under 1 second'},null,2));
