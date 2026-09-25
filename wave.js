import { an } from './vendor/an.js';
export { an };
const hashPattern = /^[A-Za-z0-9+/]{43}=$/;
const hash = value => typeof value === 'string' && hashPattern.test(value);
const text = value => typeof value === 'string' && value.length <= 20000;
export async function sign(object, key) {
  const content = JSON.stringify(object);
  return { content, message: await an.sign(await an.hash(content), key) };
}
export async function verify(record) {
  if (!record || typeof record.message !== 'string' || record.message.length !== 208 || !text(record.content)) throw Error('Invalid record');
  const opened = await an.open(record.message);
  if (!/^\d{13}[A-Za-z0-9+/]{43}=$/.test(opened) || await an.hash(record.content) !== opened.slice(13)) throw Error('Signature or content mismatch');
  const data = JSON.parse(record.content);
  if (data.version !== 1) throw Error('Unsupported record version');
  const valid = data.type === 'wave' ? text(data.title) && data.title.trim() && Array.isArray(data.participants) && data.participants.length <= 30 && data.participants.every(hash)
    : data.type === 'profile' ? text(data.name) && (data.image === null || hash(data.image))
    : data.type === 'wave/block' ? hash(data.wave) && (data.replyTo === null || hash(data.replyTo)) && text(data.text)
    : data.type === 'wave/revise' ? hash(data.wave) && hash(data.block) && text(data.text) && Array.isArray(data.replaces) && data.replaces.length > 0 && data.replaces.length <= 100 && data.replaces.every(hash)
    : false;
  if (!valid) throw Error('Invalid record fields');
  return { ...record, data, author:record.message.slice(0,44), time:Number(opened.slice(0,13)), id:await an.hash(record.message) };
}
export const order = (a,b) => a.time - b.time || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
export function project(records, waveId) {
  const root = records.find(r => r.id === waveId && r.data.type === 'wave');
  if (!root) return null;
  const members = new Set([root.author, ...root.data.participants]);
  const accepted = new Map(), blocks = new Map();
  let waiting = records.filter(r => r.data.wave === waveId && members.has(r.author)).sort(order);
  let progress = true;
  while (progress) {
    progress = false;
    waiting = waiting.filter(r => {
      const d = r.data;
      if (d.type === 'wave/block' && (d.replyTo === null || blocks.has(d.replyTo))) {
        blocks.set(r.id, r); accepted.set(r.id,r); progress = true; return false;
      }
      if (d.type === 'wave/revise' && blocks.has(d.block) && d.replaces.every(id => {
        const p = accepted.get(id);
        return p && (p.id === d.block || p.data.block === d.block);
      })) { accepted.set(r.id,r); progress = true; return false; }
      return true;
    });
  }
  const versions = id => [...accepted.values()].filter(r => r.id === id || r.data.block === id).sort(order);
  const heads = id => {
    const all = versions(id), replaced = new Set(all.flatMap(r => r.data.replaces || []));
    return all.filter(r => !replaced.has(r.id));
  };
  return {root, members:[...members], blocks:[...blocks.values()].sort(order), versions, heads, waiting};
}
export async function readBundle(bundle) {
  if (bundle?.format !== 'anproto-wave/1' || !Array.isArray(bundle.records) || bundle.records.length > 3000) throw Error('Not a Wave export');
  const records = await Promise.all(bundle.records.map(verify));
  const images = {};
  if (!bundle.images || typeof bundle.images !== 'object' || Array.isArray(bundle.images)) throw Error('Invalid images');
  for (const [id, image] of Object.entries(bundle.images)) {
    if (typeof image !== 'string' || image.length > 1000000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image) || await an.hash(image) !== id) throw Error('Invalid avatar image');
    images[id] = image;
  }
  return { records, images };
}
