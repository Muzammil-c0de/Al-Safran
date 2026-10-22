import crypto from 'node:crypto';
import { sql } from './db.js';

/** Secret used to sign admin sessions. Must be set in production. */
const secret = () => process.env.SESSION_SECRET || '';

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days (seconds)

// ---- Passwords (scrypt, salted) ----

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [alg, saltHex, hashHex] = String(stored || '').split('$');
  if (alg !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// A fixed hash to compare against when the username doesn't exist, so response time doesn't reveal valid usernames.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

const safeEqual = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

/** Fixed login: when ADMIN_USERNAME + ADMIN_PASSWORD are set in .env, they are the admin login. */
export const fixedLogin = () => Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);

export async function checkLogin(username, password) {
  if (fixedLogin()) {
    const userOk = safeEqual(username.toLowerCase(), process.env.ADMIN_USERNAME.toLowerCase());
    const passOk = safeEqual(password, process.env.ADMIN_PASSWORD);
    return userOk && passOk ? { id: 0, username: process.env.ADMIN_USERNAME } : null;
  }
  if (!sql) return null;
  const [user] = await sql`SELECT id, username, password_hash FROM admin_users WHERE lower(username) = lower(${username})`;
  const ok = verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
  return ok && user ? { id: user.id, username: user.username } : null;
}

// ---- Sessions (HMAC-signed tokens) ----

const sign = (body) => crypto.createHmac('sha256', secret()).update(body).digest('base64url');

export function createSession(user) {
  const body = Buffer.from(
    JSON.stringify({ uid: user.id, u: user.username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL })
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function readSession(token) {
  if (!secret()) return null;
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    return data.exp > Date.now() / 1000 ? data : null;
  } catch {
    return null;
  }
}

/** Express middleware: requires `Authorization: Bearer <token>`. */
export function requireAdmin(req, res, next) {
  if (!secret()) return res.status(503).json({ error: 'SESSION_SECRET is not configured on the server.' });
  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const session = readSession(token);
  if (!session) return res.status(401).json({ error: 'Please log in again.' });
  req.admin = { id: session.uid, username: session.u };
  next();
}
