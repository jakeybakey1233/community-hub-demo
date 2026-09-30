import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
export async function startStaticServer(port = 0) {
  const server = http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = await startStaticServer(8000);
  console.log(`Community Hub: ${app.url} (Ctrl+C to stop)`);
}
