const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res) => {
  let pathname; try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
  const exists = fs.existsSync(file) && fs.statSync(file).isFile();
  const output = exists ? file : path.join(root,'404.html');
  res.writeHead(exists ? 200 : 404, {'Content-Type':types[path.extname(output)] || 'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(output).pipe(res);
}).listen(4175,'127.0.0.1',()=>console.log('Maktab preview: http://127.0.0.1:4175'));
