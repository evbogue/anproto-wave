// Records, outbox, and recoverable drafts commit transactionally. Identity keys
// live in a separate browser namespace and are never part of synchronization.
const dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open('anproto-wave-v2',1);
  req.onupgradeneeded=()=>{for(const name of ['records','outbox','images','drafts'])req.result.createObjectStore(name);};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
});
async function transaction(names,mode,work) {
  const db=await dbPromise;
  return new Promise((resolve,reject)=>{const tx=db.transaction(names,mode);let value;try{value=work(tx);}catch(e){tx.abort();reject(e);return;}tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Storage transaction aborted'));});
}
export async function load() {
  const result={};await transaction(['records','outbox','images','drafts'],'readonly',tx=>{
    for(const name of ['records','outbox','images','drafts']){const req=tx.objectStore(name).getAll();req.onsuccess=()=>{result[name]=req.result;};}
  });return result;
}
export async function save(records,images={},local=false,draftId=null) {
  await transaction(['records','outbox','images','drafts'],'readwrite',tx=>{
    for(const r of records){const raw={content:r.content,message:r.message,id:r.id};tx.objectStore('records').put(raw,r.id);if(local)tx.objectStore('outbox').put(raw,r.id);}
    for(const [id,data]of Object.entries(images))tx.objectStore('images').put({id,data},id);
    if(draftId)tx.objectStore('drafts').delete(draftId);
  });
}
export const ack=ids=>transaction(['outbox'],'readwrite',tx=>{for(const id of ids)tx.objectStore('outbox').delete(id);});
export const saveDraft=draft=>transaction(['drafts'],'readwrite',tx=>tx.objectStore('drafts').put(draft,draft.id));
export const removeDraft=id=>transaction(['drafts'],'readwrite',tx=>tx.objectStore('drafts').delete(id));
export function keys(){return JSON.parse(localStorage.getItem('anproto-wave-v2-keys')||'[]');}
export function addKey(key){const all=keys();all.push(key);localStorage.setItem('anproto-wave-v2-keys',JSON.stringify(all));}
