import { Router } from 'express';
import { sql, requireDb } from '../db.js';

const router = Router();

// Public gallery: images and videos uploaded from the admin panel
router.get('/', requireDb, async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT id, kind, title, url, mime_type, created_at
      FROM media
      ORDER BY created_at DESC
      LIMIT 200
    `;
    res.set('Cache-Control', 'public, max-age=60');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
