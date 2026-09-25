import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = import.meta.dirname;
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png' };
createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!path.startsWith(root + '/') || name.includes('/.')) throw Error();
    const data = await readFile(path);
    res.writeHead(200, {'Content-Type':types[extname(path)] || 'text/plain', 'Cache-Control':'no-store'});
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(8098, '127.0.0.1', () => console.log('ANProto Wave: http://127.0.0.1:8098'));
