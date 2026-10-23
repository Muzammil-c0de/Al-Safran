// End-to-end check of home banners: add (desktop + phone images) → public list → images served → hide → delete.
// Usage: start the API, then: node scripts/check-banners.js [port]
import 'dotenv/config';
import fs from 'node:fs';

const ORIGIN = `http://localhost:${process.argv[2] || process.env.PORT || 5000}`;
const API = `${ORIGIN}/api`;
const log = (ok, msg) => console.log(`${ok ? '✔' : '✘'} ${msg}`);
const img = (name) => new Blob([fs.readFileSync(new URL(`../../client/public/${name}`, import.meta.url))], { type: 'image/webp' });

const { token } = await fetch(`${API}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
}).then((r) => r.json());
const auth = { Authorization: `Bearer ${token}` };
log(Boolean(token), 'Logged in as admin');

const form = new FormData();
form.append('title', 'Banner *test* — please ignore');
form.append('eyebrow', 'Connection test');
form.append('button_label', 'Services');
form.append('button_link', '/services');
form.append('desktop', img('ourservice banner.webp'), 'desktop.webp');
form.append('mobile', img('images/FCU.webp'), 'mobile.webp');
const res = await fetch(`${API}/admin/banners`, { method: 'POST', headers: auth, body: form });
const banner = await res.json();
log(res.ok, `Add banner → ${res.status} ${res.ok ? `desktop ${banner.desktop_url}, phone ${banner.mobile_url}` : banner.error}`);
if (!res.ok) process.exit(1);

const pub = await fetch(`${API}/banners`).then((r) => r.json());
log(pub.some((b) => b.id === banner.id), `Public slider list includes it (${pub.length} active)`);

for (const [label, url] of [['Desktop', banner.desktop_url], ['Phone', banner.mobile_url]]) {
  const r = await fetch(url.startsWith('/api/') ? ORIGIN + url : url);
  log(r.ok, `${label} image served from R2 → ${r.status}, ${Math.round((await r.arrayBuffer()).byteLength / 1024)} KB`);
}

const hide = new FormData();
hide.append('is_active', 'false');
await fetch(`${API}/admin/banners/${banner.id}`, { method: 'PATCH', headers: auth, body: hide });
const afterHide = await fetch(`${API}/banners`).then((r) => r.json());
log(!afterHide.some((b) => b.id === banner.id), 'Hidden banner no longer shows on the website');

const del = await fetch(`${API}/admin/banners/${banner.id}`, { method: 'DELETE', headers: auth });
log(del.ok, 'Test banner deleted (database + both images in R2)');
