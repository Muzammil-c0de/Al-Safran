import { neon } from '@neondatabase/serverless';

// `sql` is null when DATABASE_URL is missing so the API can still boot in dev.
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export function requireDb(req, res, next) {
  if (!sql) return res.status(503).json({ error: 'Database is not configured (DATABASE_URL missing).' });
  next();
}
