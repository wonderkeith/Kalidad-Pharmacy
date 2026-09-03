import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const imageExt = /\.(png|jpe?g|webp|gif|svg|ico)$/i;
const htmlExt = /\.html$/i;

for (const name of fs.readdirSync(root)) {
  const source = path.join(root, name);
  if (!fs.statSync(source).isFile()) continue;
  if (imageExt.test(name)) fs.copyFileSync(source, path.join(dist, name));
  if (htmlExt.test(name) && name !== 'index.html') fs.copyFileSync(source, path.join(dist, name));
}

fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
