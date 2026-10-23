// End-to-end check of the gallery: direct upload to R2 → media record → listed publicly → served → deleted.
// Usage: start the API (npm run dev), then: node scripts/check-gallery.js [port]
import { API, ORIGIN, log, login, uploadDirect, json } from './_client.js';

const auth = await login();
log(true, 'Logged in as admin');

const key = await uploadDirect(auth, 'images/FCU.webp', 'images');
log(true, `Uploaded straight to R2 → ${key}`);

const res = await fetch(`${API}/admin/media`, json(auth, 'POST', { file_key: key, title: 'Gallery connection test' }));
const item = await res.json();
log(res.ok, `Media record saved → ${res.status} ${res.ok ? item.url : item.error}`);
if (!res.ok) process.exit(1);

const list = await fetch(`${API}/media`).then((r) => r.json());
log(list.some((m) => m.id === item.id), `Public gallery list includes it (${list.length} item(s))`);

const img = await fetch(item.url.startsWith('/api/') ? ORIGIN + item.url : item.url);
log(img.ok, `Image loads → ${img.status}, ${Math.round((await img.arrayBuffer()).byteLength / 1024)} KB`);

const del = await fetch(`${API}/admin/media/${item.id}`, { method: 'DELETE', headers: auth });
log(del.ok, 'Test image deleted (from R2 and the database)');
