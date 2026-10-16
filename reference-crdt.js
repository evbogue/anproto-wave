// Deliberately slow independent oracle for valid fixture events only. It is not
// a signature/authorization validator. Uses causal paths and flat sorting,
// rather than the production reducer's child adjacency traversal.
export function referenceText(records,blipId) {
  const byId=new Map(records.map(r=>[r.id,r])),clocks=new Map(),atoms=new Map(),removed=new Set();
  const clock=id=>{if(clocks.has(id))return clocks.get(id);const r=byId.get(id);if(!r)throw Error('Missing fixture dependency');const n=r.data.deps?1+Math.max(...r.data.deps.map(clock)):0;clocks.set(id,n);return n;};
  const insert=(r,op,text,after)=>{[...text].forEach((value,i)=>{const id=`${r.id}:${op}:${i}`;atoms.set(id,{id,value,after,rank:[clock(r.id),r.id,op,i]});after=id;});};
  for(const r of records){if(r.id===blipId)insert(r,0,r.data.text,null);if(r.data.type==='edit'&&r.data.blip===blipId)r.data.ops.forEach((o,i)=>{if(o.kind==='insert')insert(r,i,o.text,o.after);else for(const id of o.ids)removed.add(id);});}
  const path=e=>{const p=[];while(e){p.unshift(e.rank);e=atoms.get(e.after);}return p;};
  const cmp=(x,y)=>{for(let i=0;i<4;i++){if(x[i]!==y[i])return x[i]<y[i]?1:-1;}return 0;};
  return [...atoms.values()].sort((a,b)=>{const x=path(a),y=path(b);for(let i=0;i<Math.min(x.length,y.length);i++){const c=cmp(x[i],y[i]);if(c)return c;}return x.length-y.length;}).filter(e=>!removed.has(e.id)).map(e=>e.value).join('');
}
