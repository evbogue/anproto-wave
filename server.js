import { createServer } from 'node:http';
import { readFile, mkdir, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { readBundle, project, verify, LIMITS } from './crdt.js';
const root=import.meta.dirname;
const assets=new Set(['index.html','app.js','wave.css','crdt.js','store-v2.js','legacy.html','legacy-app.js','wave.js','store.js','vendor/an.js','vendor/wiredove.css','vendor/wiredove-render.js','vendor/doveorange_sm.png','vendor/lib/nacl-fast-es.js','vendor/lib/base64.js']);
const types={html:'text/html',js:'text/javascript',css:'text/css',png:'image/png'};
const MAX=20*1024*1024;
export async function createRelay({directory=resolve(root,'.wave-data'),port=8098}={}) {
  await mkdir(directory,{recursive:true,mode:0o700});
  let state={format:'anproto-wave/2',records:[],images:{}},checked;
  try{state=JSON.parse(await readFile(resolve(directory,'records.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  checked=await readBundle(state);
  let revision=randomUUID(),queue=Promise.resolve(),connections=0;
  const presence=new Map();
  const activity=()=>{for(const [id,p]of presence)if(p.expires<Date.now())presence.delete(id);return [...presence.values()];};
  const server=createServer(async(req,res)=>{
    const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
    try {
      const host=req.headers.host,origin=`http://127.0.0.1:${server.address().port}`;
      if(host!==`127.0.0.1:${server.address().port}`&&host!==`localhost:${server.address().port}`)return send(403,{error:'Invalid host'});
      if(req.headers.origin&&req.headers.origin!==origin&&req.headers.origin!==`http://localhost:${server.address().port}`)return send(403,{error:'Invalid origin'});
      if(req.headers['sec-fetch-site']==='cross-site')return send(403,{error:'Cross-site request'});
      const url=new URL(req.url,origin);
      if(url.pathname==='/sync'&&req.method==='GET')return send(200,url.searchParams.get('revision')===revision?{revision,presence:activity()}:{revision,...state,presence:activity()});
      if(url.pathname==='/presence'&&req.method==='POST') {
        if(!req.headers.origin||req.headers['content-type']!=='application/json')return send(403,{error:'Same-origin JSON required'});
        let body='',size=0;for await(const chunk of req){size+=chunk.length;if(size>4096)return send(413,{error:'Presence too large'});body+=chunk;}
        const r=await verify(JSON.parse(body)),m=project(checked.records,r.data.wave);
        if(r.data.type!=='presence'||Math.abs(Date.now()-r.time)>10000||!m?.members.includes(r.author)||!m.blips.has(r.data.blip))throw Error('Invalid presence');
        activity();if(presence.size>=256&&!presence.has(r.author))throw Error('Presence limit exceeded');
        presence.set(r.author,{content:r.content,message:r.message,author:r.author,wave:r.data.wave,blip:r.data.blip,expires:r.time+10000});return send(200,{ok:true});
      }
      if(url.pathname==='/sync'&&req.method==='POST') {
        if(!req.headers.origin||req.headers['content-type']!=='application/json')return send(403,{error:'Same-origin JSON required'});
        let bytes=0,chunks=[];
        for await(const chunk of req){bytes+=chunk.length;if(bytes>MAX)return send(413,{error:'Request too large'});chunks.push(chunk);}
        const incoming=await readBundle(JSON.parse(Buffer.concat(chunks).toString()));
        const commit=queue.then(async()=>{
          const all=[...new Map([...checked.records,...incoming.records].map(r=>[r.id,r])).values()];
          if(all.length>LIMITS.events)throw Error('Relay inventory full');
          for(const r of all)if(r.data.type==='wave') { const model=project(all,r.id);const invalid=incoming.records.find(r=>model.rejected.has(r.id));if(invalid)throw Error('Invalid Wave contribution: '+model.rejected.get(invalid.id)); }
          const next={format:'anproto-wave/2',records:all.map(({content,message})=>({content,message})),images:{...state.images,...incoming.images}};
          const serialized=JSON.stringify(next);if(Buffer.byteLength(serialized)>32*1024*1024)throw Error('Relay storage full');
          // Flush the replacement file before rename, then flush its containing directory.
          const {open}=await import('node:fs/promises');
          const file=await open(resolve(directory,'records.tmp'),'w',0o600);
          try{await file.writeFile(serialized);await file.sync();}finally{await file.close();}
          await rename(resolve(directory,'records.tmp'),resolve(directory,'records.json'));
          const dir=await open(directory,'r');try{await dir.sync();}finally{await dir.close();}
          state=next;checked={records:all,images:next.images};revision=randomUUID();
          return {ids:incoming.records.map(r=>r.id),revision};
        });queue=commit.catch(()=>{});return send(200,await commit);
      }
      if(req.method!=='GET')return send(405,{error:'Method not allowed'});
      const name=url.pathname==='/'?'index.html':url.pathname.slice(1);
      if(!assets.has(name))return send(404,{error:'Not found'});
      const data=await readFile(resolve(root,name));res.writeHead(200,{'Content-Type':types[name.split('.').at(-1)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; connect-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'"});res.end(data);
    }catch(e){if(!res.headersSent)send(400,{error:e.message});else res.end();}
  });
  server.maxConnections=32;server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=3000;
  server.on('connection',socket=>{if(++connections>32)socket.destroy();socket.on('close',()=>connections--);});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)createRelay().then(s=>console.log(`ANProto Wave: http://127.0.0.1:${s.address().port}`)).catch(e=>{console.error(e);process.exitCode=1;});
