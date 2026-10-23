// End-to-end check of home banners: direct uploads → banner saved → public list → hide → delete.
// Usage: start the API, then: node scripts/check-banners.js [port]
import { API, ORIGIN, log, login, uploadDirect, json } from './_client.js';

const auth = await login();
log(true, 'Logged in as admin');

const desktop_key = await uploadDirect(auth, 'ourservice banner.webp', 'banners');
const mobile_key = await uploadDirect(auth, 'images/FCU.webp', 'banners');
log(true, 'Desktop + phone images uploaded straight to R2');

const res = await fetch(
  `${API}/admin/banners`,
  json(auth, 'POST', { title: 'Banner *test* — please ignore', eyebrow: 'Connection test', button_label: 'Services', button_link: '/services', desktop_key, mobile_key })
);
const banner = await res.json();
log(res.ok, `Banner saved → ${res.status} ${res.ok ? '' : banner.error}`);
if (!res.ok) process.exit(1);

const pub = await fetch(`${API}/banners`).then((r) => r.json());
log(pub.some((b) => b.id === banner.id), `Public slider list includes it (${pub.length} active)`);

for (const [label, url] of [['Desktop', banner.desktop_url], ['Phone', banner.mobile_url]]) {
  const r = await fetch(url.startsWith('/api/') ? ORIGIN + url : url);
  log(r.ok, `${label} image loads → ${r.status}`);
}

await fetch(`${API}/admin/banners/${banner.id}`, json(auth, 'PATCH', { is_active: 'false' }));
const afterHide = await fetch(`${API}/banners`).then((r) => r.json());
log(!afterHide.some((b) => b.id === banner.id), 'Hidden banner no longer shows on the website');

const del = await fetch(`${API}/admin/banners/${banner.id}`, { method: 'DELETE', headers: auth });
log(del.ok, 'Test banner deleted (database + both images in R2)');
