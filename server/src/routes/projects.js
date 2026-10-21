import { Router } from 'express';
import { sql, requireDb } from '../db.js';

const router = Router();

router.get('/', requireDb, async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT id, title, category, location, description, image_url, completed_on, created_at
      FROM projects
      ORDER BY COALESCE(completed_on, created_at::date) DESC, id DESC
    `;
    res.set('Cache-Control', 'public, max-age=60');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
