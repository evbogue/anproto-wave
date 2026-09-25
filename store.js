const name = 'anproto-wave-demo-v1';
const empty = () => ({ records:[], images:{}, identities:[] });
export function load() {
  return JSON.parse(localStorage.getItem(name) || 'null') || empty();
}
export function save({records = [], images = {}, identities = []}) {
  const old = load();
  const combined = {
    records:[...new Map([...old.records, ...records].map(r => [r.message, {message:r.message,content:r.content}])).values()],
    images:{...old.images,...images},
    identities:[...new Map([...old.identities,...identities].map(k => [k.slice(0,44), k])).values()]
  };
  localStorage.setItem(name, JSON.stringify(combined));
  return combined;
}
