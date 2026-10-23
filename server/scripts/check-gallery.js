// End-to-end check of the gallery: admin upload → stored in R2 → listed publicly → served → deleted.
// Usage: start the API (npm run dev), then: node scripts/check-gallery.js [port]
import 'dotenv/config';
import fs from 'node:fs';

const ORIGIN = `http://localhost:${process.argv[2] || process.env.PORT || 5000}`;
const API = `${ORIGIN}/api`;
const log = (ok, msg) => console.log(`${ok ? '✔' : '✘'} ${msg}`);

const login = await fetch(`${API}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
}).then((r) => r.json());
if (!login.token) throw new Error('Login failed: ' + JSON.stringify(login));
const auth = { Authorization: `Bearer ${login.token}` };
log(true, 'Logged in as admin');

// Upload a real photo from the site
const file = new URL('../../client/public/images/FCU.webp', import.meta.url);
const form = new FormData();
form.append('title', 'Gallery connection test');
form.append('file', new Blob([fs.readFileSync(file)], { type: 'image/webp' }), 'test.webp');
const up = await fetch(`${API}/admin/media`, { method: 'POST', headers: auth, body: form });
const item = await up.json();
log(up.ok, `Upload → ${up.status} ${up.ok ? `stored as ${item.url}` : item.error}`);
if (!up.ok) process.exit(1);

const list = await fetch(`${API}/media`).then((r) => r.json());
log(list.some((m) => m.id === item.id), `Public gallery list includes it (${list.length} item(s))`);

const fileUrl = item.url.startsWith('/api/') ? `${ORIGIN}${item.url}` : item.url;
const img = await fetch(fileUrl);
const bytes = (await img.arrayBuffer()).byteLength;
log(img.ok && bytes > 1000, `Image served from R2 → ${img.status}, ${Math.round(bytes / 1024)} KB, ${img.headers.get('content-type')}`);

const del = await fetch(`${API}/admin/media/${item.id}`, { method: 'DELETE', headers: auth });
log(del.ok, 'Test image deleted (from R2 and the database)');
