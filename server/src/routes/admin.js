import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { sql, requireDb } from '../db.js';
import { uploadImage, deleteObject, ALLOWED_IMAGE_TYPES } from '../r2.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    ALLOWED_IMAGE_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(Object.assign(new Error('Only JPG, PNG, WEBP or AVIF images are allowed.'), { status: 400 })),
});

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  const given = req.get('x-admin-token') || '';
  if (!expected) return res.status(503).json({ error: 'ADMIN_TOKEN is not configured on the server.' });
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Invalid admin token.' });
  }
  next();
}

router.use(requireAdmin, requireDb);

router.get('/verify', (req, res) => res.json({ ok: true }));

// ---- Messages ----
router.get('/messages', async (req, res, next) => {
  try {
    res.json(await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500`);
  } catch (err) {
    next(err);
  }
});

router.delete('/messages/:id', async (req, res, next) => {
  try {
    await sql`DELETE FROM contact_messages WHERE id = ${Number(req.params.id)}`;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---- Projects ----
router.post('/projects', upload.single('image'), async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim().slice(0, 200);
    const category = (req.body.category || '').trim().slice(0, 120);
    const location = (req.body.location || '').trim().slice(0, 200);
    const description = (req.body.description || '').trim().slice(0, 4000);
    const completedOn = /^\d{4}-\d{2}-\d{2}$/.test(req.body.completed_on || '') ? req.body.completed_on : null;

    if (!title || !category) return res.status(400).json({ error: 'Title and category are required.' });

    let image = { key: null, url: null };
    if (req.file) image = await uploadImage(req.file, 'projects');

    const [row] = await sql`
      INSERT INTO projects (title, category, location, description, image_key, image_url, completed_on)
      VALUES (${title}, ${category}, ${location || null}, ${description || null}, ${image.key}, ${image.url}, ${completedOn})
      RETURNING *
    `;
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/projects/:id', async (req, res, next) => {
  try {
    const [row] = await sql`DELETE FROM projects WHERE id = ${Number(req.params.id)} RETURNING image_key`;
    if (!row) return res.status(404).json({ error: 'Project not found.' });
    await deleteObject(row.image_key).catch((e) => console.warn('R2 delete failed:', e.message));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
