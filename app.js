import { an, sign, verify, project, readBundle, order } from './wave.js';
import { visual } from './vendor/wiredove-render.js';
import { load, save } from './store.js';
const $ = id => document.getElementById(id);
let state, records = [], active = '', selected = '';
const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  Object.assign(node, attrs);
  node.append(...children);
  return node;
};
const say = message => { $('notice').textContent = message; };
const run = action => async () => { try { await action(); } catch (e) { say(e.message || 'Could not complete action'); } };
const button = (label, action) => el('button', {type:'button', textContent:label, onclick:run(action)});
const key = () => state.identities.find(k => k.slice(0,44) === active);
function profile(pubkey) {
  const p = records.filter(r => r.author === pubkey && r.data.type === 'profile').sort(order).at(-1);
  return p?.data || {name:pubkey.slice(0,10), image:null};
}
function avatar(pubkey, large = false) {
  const image = visual(pubkey), fallback = image.src;
  image.className = large ? 'profile-photo' : 'avatar';
  image.alt = profile(pubkey).name + ' avatar';
  image.onerror = () => { image.onerror = null; image.src = fallback; };
  const src = state.images[profile(pubkey).image];
  if (src) image.src = src;
  return image;
}
function person(pubkey) {
  return el('span', {className:'person', title:pubkey}, [avatar(pubkey), el('span', {textContent:profile(pubkey).name})]);
}
async function refresh() {
  state = load();
  const checked = await readBundle({format:'anproto-wave/1',records:state.records,images:state.images});
  records = [...new Map(checked.records.map(r => [r.id,r])).values()];
  active ||= state.identities[0]?.slice(0,44) || '';
  render();
}
async function add(data, signingKey = key()) {
  if (!signingKey) throw Error('Create an identity first.');
  const record = await sign({version:1,...data}, signingKey);
  const verified = await verify(record);
  save({records:[record]});
  await refresh();
  return verified;
}
function editor(container, label, initial, submit) {
  container.replaceChildren();
  const field = el('textarea', {value:initial, maxLength:12000, 'ariaLabel':label});
  const saveButton = button('Save', async () => {
    if (!field.value.trim()) throw Error('Write something first.');
    saveButton.disabled = true;
    try { await submit(field.value); container.replaceChildren(); }
    finally { saveButton.disabled = false; }
  });
  container.append(el('label',{textContent:label}), field, el('div',{className:'toolbar'},[saveButton,button('Cancel',()=>container.replaceChildren())]));
  field.focus();
}
function render() {
  $('identity').replaceChildren(...state.identities.map(k => el('option',{value:k.slice(0,44),textContent:profile(k.slice(0,44)).name})));
  $('identity').value = active;
  const roots = records.filter(r => r.data.type === 'wave').sort(order);
  if (!roots.some(r => r.id === selected)) selected = roots.at(-1)?.id || '';
  $('notebooks').replaceChildren(...roots.map(r => el('option',{value:r.id,textContent:r.data.title})));
  $('notebooks').value = selected;
  $('profile-button').disabled = !active;
  $('export').disabled = !selected;
  const area = $('wave'); area.replaceChildren();
  const model = project(records, selected);
  if (!model) {
    area.append(el('section',{className:'message'},[el('h2',{textContent:'Your first shared notebook'}),el('p',{textContent:'Load the two-person example to explore replies, edits, avatars, and a real revision conflict. Or create your own identity and Wave.'})]));
    return;
  }
  const canWrite = model.members.includes(active);
  area.append(el('section',{className:'message'},[
    el('h2',{textContent:model.root.data.title}),
    el('div',{className:'participants'},model.members.map(person)),
    el('p',{className:'message-meta',textContent:canWrite ? 'All participants can add notes and edit shared text. Saved changes retain their signatures.' : 'Read-only: this identity is not a participant. Switch to a participant to contribute.'})
  ]));
  const renderBlock = (block, depth = 0) => {
    const card = el('article',{className:'message'}), heads = model.heads(block.id);
    const slot = el('div');
    for (const head of heads) {
      card.append(el('div',{className:heads.length > 1 ? 'conflict' : ''},[
        el('div',{className:'toolbar'},[person(head.author), el('span',{className:'message-meta',textContent:head.id === block.id ? 'wrote this note' : 'revised this note'})]),
        el('p',{className:'wave-text',textContent:head.data.text})
      ]));
    }
    if (heads.length > 1) card.prepend(el('p',{textContent:'Two or more versions · Choose or combine them. Both remain in history.'}));
    const controls = el('div',{className:'toolbar'});
    if (canWrite) {
      controls.append(button('Reply', () => editor(slot,'Reply to this note','', async text => add({type:'wave/block',wave:selected,replyTo:block.id,text}))));
      // Capture the versions displayed when editing begins. Later imports must not
      // cause a stale editor to silently overwrite versions it has never seen.
      controls.append(button(heads.length > 1 ? 'Combine versions' : 'Edit', () => {
        const replaces = heads.map(r => r.id), wave = selected;
        editor(slot,'Edit shared text',heads.map(r => r.data.text).join('\n\n'), text => add({type:'wave/revise',wave,block:block.id,replaces,text}));
      }));
      if (heads.length > 1) for (const head of heads) controls.append(button('Use '+profile(head.author).name+"’s version", () => add({type:'wave/revise',wave:selected,block:block.id,replaces:heads.map(r=>r.id),text:head.data.text})));
    }
    const history = el('details',{},[el('summary',{textContent:'History · '+model.versions(block.id).length+' version(s)'})]);
    for (const v of model.versions(block.id)) history.append(el('div',{className:'message'},[
      person(v.author),el('p',{className:'message-meta',textContent:new Date(v.time).toLocaleString()+' · signature verified'}),
      el('p',{className:'wave-text',textContent:v.data.text})
    ]));
    card.append(controls,slot,history);
    const replies = model.blocks.filter(b => b.data.replyTo === block.id);
    if (replies.length && depth < 100) card.append(el('div',{className:'reply-group'},replies.map(b => renderBlock(b,depth+1))));
    return card;
  };
  area.append(...model.blocks.filter(b=>b.data.replyTo===null).map(b=>renderBlock(b)));
  if (canWrite) {
    const compose = el('section',{className:'message'}), slot = el('div');
    compose.append(button('Add a note',()=>editor(slot,'New note','',text=>add({type:'wave/block',wave:selected,replyTo:null,text}))),slot);
    area.append(compose);
  }
  if (model.waiting.length) area.append(el('p',{textContent:model.waiting.length+' record(s) have missing or incompatible references and are not applied.'}));
}
$('identity').onchange = () => { active = $('identity').value; $('profile').replaceChildren(); render(); };
$('notebooks').onchange = () => { selected = $('notebooks').value; render(); };
$('add-person').onclick = run(async () => {
  const k = await an.gen(); save({identities:[k]}); active = k.slice(0,44); await refresh(); openProfile();
});
function openProfile() {
  const owner = active, signingKey = key(), current = profile(owner);
  const image = avatar(owner,true), name = el('input',{type:'text',value:current.name,maxLength:100,ariaLabel:'Display name'});
  let imageHash = current.image, imageData = imageHash ? state.images[imageHash] : null;
  const file = el('input',{type:'file',accept:'image/*',ariaLabel:'Choose avatar image'});
  // Wiredove profile_header.js: square center crop to a 256px canvas, then
  // content-address the data URL. Keep that exact representation for exports.
  file.onchange = run(async () => {
    const chosen = file.files[0]; if (!chosen) return;
    if (chosen.size > 10000000) throw Error('Choose an image smaller than 10 MB.');
    const src = await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(chosen);});
    const img = new Image(); img.src = src; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width=canvas.height=256;
    const side = Math.min(img.width,img.height);
    canvas.getContext('2d').drawImage(img,Math.floor((img.width-side)/2),Math.floor((img.height-side)/2),side,side,0,0,256,256);
    imageData=canvas.toDataURL(); imageHash=await an.hash(imageData); image.src=imageData;
  });
  $('profile').replaceChildren(el('div',{className:'message'},[
    image,el('p',{className:'wave-text',textContent:owner}),name,file,
    button('Use generated avatar',()=>{imageHash=null;imageData=null;image.src=visual(owner).src;}),
    button('Save profile',async()=>{
      if(!name.value.trim()) throw Error('Enter a display name.');
      const record=await sign({type:'profile',version:1,name:name.value.trim(),image:imageHash},signingKey);
      save({records:[record],images:imageHash?{[imageHash]:imageData}:{}});
      $('profile').replaceChildren(); await refresh(); say('Profile signed and saved locally.');
    }),button('Cancel',()=>$('profile').replaceChildren())
  ]));
}
$('profile-button').onclick = run(openProfile);
$('create').onclick = run(()=>{
  if (!active) throw Error('Create an identity first.');
  const title = el('input',{type:'text',placeholder:'Notebook title',ariaLabel:'Notebook title',maxLength:150});
  const participants = el('textarea',{placeholder:'Additional public keys, one per line',ariaLabel:'Participant public keys'});
  $('new-wave').replaceChildren(title,participants,button('Create notebook',async()=>{
    const people=participants.value.split(/\s+/).filter(Boolean);
    const r=await add({type:'wave',title:title.value.trim(),participants:people}); selected=r.id;
    $('new-wave').replaceChildren();render();
  }),button('Cancel',()=>$('new-wave').replaceChildren()));
});
$('example').onclick = run(async()=>{
  const alice=await an.gen(), bob=await an.gen(), a=alice.slice(0,44), b=bob.slice(0,44);
  const examples=[];
  const make=async(data,k)=>{const r=await sign({version:1,...data},k);examples.push(r);return await an.hash(r.message);};
  await make({type:'profile',name:'Alex',image:null},alice); await make({type:'profile',name:'Sam',image:null},bob);
  const wave=await make({type:'wave',title:'A small Wave, together',participants:[b]},alice);
  const block=await make({type:'wave/block',wave,replyTo:null,text:'Let’s make a notebook where we can think together. Each note can grow, and every version stays signed.'},alice);
  await make({type:'wave/block',wave,replyTo:block,text:'I can reply right here. Try switching “Writing as” to Sam, then edit or add a note.'},bob);
  const conflict=await make({type:'wave/block',wave,replyTo:null,text:'Our first experiment: plan a gathering.'},alice);
  await make({type:'wave/revise',wave,block:conflict,replaces:[conflict],text:'Our first experiment: a Saturday picnic by the lake.'},alice);
  await make({type:'wave/revise',wave,block:conflict,replaces:[conflict],text:'Our first experiment: a Sunday afternoon reading group.'},bob);
  save({identities:[alice,bob],records:examples});active=a;selected=wave;await refresh();
  say('Example loaded. Alex and Sam are demo identities controlled by this browser. The competing revisions are real signed records.');
});
$('export').onclick = run(()=>{
  const model=project(records,selected), members=new Set(model.members);
  const exported=records.filter(r=>r.id===selected||r.data.wave===selected||(r.data.type==='profile'&&members.has(r.author)));
  const imageIds=new Set(exported.filter(r=>r.data.type==='profile').map(r=>r.data.image));
  const images=Object.fromEntries(Object.entries(state.images).filter(([id])=>imageIds.has(id)));
  const bundle={format:'anproto-wave/1',records:exported.map(({content,message})=>({content,message})),images};
  $('transfer').hidden=false; $('bundle').value=JSON.stringify(bundle,null,2);
  const url=URL.createObjectURL(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}));
  const link=el('a',{href:url,download:'anproto-wave.json'});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  say('Export ready below, with signed profiles and avatar images. Copy the JSON if your browser does not download the file. No private keys included.');
});
$('import').onclick=()=>{ $('transfer').hidden=false; $('bundle').value=''; $('bundle').focus(); };
$('choose-file').onclick=()=>$('import-file').click();
$('close-transfer').onclick=()=>{ $('transfer').hidden=true; };
async function importBundle(value) {
  if (value.length>10000000) throw Error('Export is too large (10 MB maximum).');
  const checked=await readBundle(JSON.parse(value));
  save(checked); selected=checked.records.find(r=>r.data.type==='wave')?.id||selected;
  await refresh();say('Imported and verified. Existing records were preserved; private identities were not imported.');
  $('transfer').hidden=true;
}
$('import-text').onclick=run(()=>importBundle($('bundle').value));
$('import-file').onchange=run(async()=>{
  const file=$('import-file').files[0];if(!file)return;
  if(file.size>10000000)throw Error('Export is too large (10 MB maximum).');
  await importBundle(await file.text());$('import-file').value='';
});
window.addEventListener('storage',()=>say('Notebook data changed in another tab. Reload to see it; save any open draft first.'));
refresh().catch(e=>say('Could not load local data: '+e.message));
