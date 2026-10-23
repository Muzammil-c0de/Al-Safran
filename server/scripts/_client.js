// Tiny helper for the check-* scripts: logs in and uploads files the same way the admin panel does
// (ask the API for a signed link → PUT the file straight into R2 → use the returned key).
import 'dotenv/config';
import fs from 'node:fs';

export const ORIGIN = `http://localhost:${process.argv[2] || process.env.PORT || 5000}`;
export const API = `${ORIGIN}/api`;
export const log = (ok, msg) => console.log(`${ok ? '✔' : '✘'} ${msg}`);

export async function login() {
  const res = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }),
  }).then((r) => r.json());
  if (!res.token) throw new Error('Login failed: ' + JSON.stringify(res));
  return { Authorization: `Bearer ${res.token}`, 'Content-Type': 'application/json' };
}

/** Uploads a file from client/public straight to R2; returns its key. */
export async function uploadDirect(auth, publicPath, folder) {
  const data = fs.readFileSync(new URL(`../../client/public/${publicPath}`, import.meta.url));
  const signed = await fetch(`${API}/admin/uploads`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ folder, contentType: 'image/webp', size: data.length }),
  }).then((r) => r.json());
  if (!signed.uploadUrl) throw new Error('Signing failed: ' + JSON.stringify(signed));
  const put = await fetch(signed.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: data });
  if (!put.ok) throw new Error(`Direct upload to R2 failed: ${put.status}`);
  return signed.key;
}

export const json = (auth, method, body) => ({ method, headers: auth, body: JSON.stringify(body) });
