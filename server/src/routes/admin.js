import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { sql, requireDb } from '../db.js';
import { checkLogin, createSession, fixedLogin, hashPassword, requireAdmin, verifyPassword } from '../auth.js';
import { createUploadUrl, deleteObject, verifyUpload, uploadFile, UPLOAD_FOLDERS } from '../r2.js';

// Files are uploaded by the browser straight to R2 (POST /uploads gives the link); these routes only save records.

const router = Router();

const id = (req) => Number(req.params.id);

// ---------------- Auth ----------------

// Max 10 login attempts per 15 minutes per IP
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }), async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) return res.status(400).json({ error: 'Enter your username and password.' });
    if (!process.env.SESSION_SECRET) return res.status(503).json({ error: 'SESSION_SECRET is not configured on the server.' });

    const user = await checkLogin(username, password);
    if (!user) return res.status(401).json({ error: 'Incorrect username or password.' });
    res.json({ token: createSession(user), username: user.username });
  } catch (err) {
    next(err);
  }
});

// Everything below requires a valid session
router.use(requireAdmin);

router.get('/me', (req, res) => res.json({ username: req.admin.username, fixed: fixedLogin() }));

/**
 * Step 1 of every upload: { folder, contentType, size } → { key, uploadUrl }.
 * The browser then PUTs the file to uploadUrl (straight into R2) and sends `key` with the record.
 */
router.post('/uploads', async (req, res, next) => {
  try {
    const { folder, contentType, size } = req.body || {};
    res.json(await createUploadUrl({ folder: String(folder), contentType: String(contentType), size: Number(size) }));
  } catch (err) {
    next(err);
  }
});

/**
 * Backup upload path for small files (≤ 4 MB — Vercel's request-size cap): the browser sends the file to the API,
 * which stores it in R2. Used automatically when the bucket's CORS rule blocks direct browser uploads.
 * POST /uploads/via-api?folder=images   body = raw file, Content-Type = the file's type
 */
router.post('/uploads/via-api', express.raw({ type: () => true, limit: '4400kb' }), async (req, res, next) => {
  try {
    const folder = String(req.query.folder || '');
    if (!UPLOAD_FOLDERS.includes(folder)) return res.status(400).json({ error: 'Invalid upload folder.' });
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: 'No file received.' });
    const file = await uploadFile({ buffer: req.body, mimetype: req.get('content-type') }, folder);
    res.status(201).json({ key: file.key });
  } catch (err) {
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'File too large for this upload path (max 4 MB).' });
    next(err);
  }
});

router.use(requireDb);

router.post('/password', async (req, res, next) => {
  try {
    if (fixedLogin()) {
      return res.status(400).json({ error: 'The login is fixed in the server settings (.env). Change ADMIN_PASSWORD there.' });
    }
    const current = String(req.body.current || '');
    const next_ = String(req.body.next || '');
    if (next_.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    const [user] = await sql`SELECT password_hash FROM admin_users WHERE id = ${req.admin.id}`;
    if (!user || !verifyPassword(current, user.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    await sql`UPDATE admin_users SET password_hash = ${hashPassword(next_)} WHERE id = ${req.admin.id}`;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------------- Dashboard ----------------

router.get('/stats', async (req, res, next) => {
  try {
    const [m] = await sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE NOT is_read)::int AS unread FROM contact_messages`;
    const [p] = await sql`SELECT count(*)::int AS total FROM projects`;
    const [md] = await sql`
      SELECT count(*) FILTER (WHERE kind = 'image')::int AS images,
             count(*) FILTER (WHERE kind = 'video')::int AS videos
      FROM media`;
    res.json({ messages: m.total, unread: m.unread, projects: p.total, images: md.images, videos: md.videos });
  } catch (err) {
    next(err);
  }
});

// ---------------- Messages ----------------

router.get('/messages', async (req, res, next) => {
  try {
    res.json(await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500`);
  } catch (err) {
    next(err);
  }
});

router.patch('/messages/:id', async (req, res, next) => {
  try {
    const isRead = Boolean(req.body.is_read);
    await sql`UPDATE contact_messages SET is_read = ${isRead} WHERE id = ${id(req)}`;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/messages/:id', async (req, res, next) => {
  try {
    await sql`DELETE FROM contact_messages WHERE id = ${id(req)}`;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------------- Projects ----------------

// Body (JSON): title, category, location, description, completed_on, image_key (from POST /uploads, optional)
router.post('/projects', async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim().slice(0, 200);
    const category = (req.body.category || '').trim().slice(0, 120);
    const location = (req.body.location || '').trim().slice(0, 200);
    const description = (req.body.description || '').trim().slice(0, 4000);
    const completedOn = /^\d{4}-\d{2}-\d{2}$/.test(req.body.completed_on || '') ? req.body.completed_on : null;

    if (!title || !category) return res.status(400).json({ error: 'Title and category are required.' });

    let image = { key: null, url: null };
    if (req.body.image_key) {
      image = await verifyUpload(req.body.image_key, ['projects']);
      if (image.kind !== 'image') return res.status(400).json({ error: 'The project photo must be an image.' });
    }

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
    const [row] = await sql`DELETE FROM projects WHERE id = ${id(req)} RETURNING image_key`;
    if (!row) return res.status(404).json({ error: 'Project not found.' });
    await deleteObject(row.image_key).catch((e) => console.warn('R2 delete failed:', e.message));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------------- Media (images & videos) ----------------

router.get('/media', async (req, res, next) => {
  try {
    res.json(await sql`SELECT * FROM media ORDER BY created_at DESC LIMIT 1000`);
  } catch (err) {
    next(err);
  }
});

// Body (JSON): file_key (from POST /uploads), title
router.post('/media', async (req, res, next) => {
  try {
    if (!req.body.file_key) return res.status(400).json({ error: 'Choose an image or video to upload.' });
    const file = await verifyUpload(req.body.file_key, ['images', 'videos']);
    const title = String(req.body.title || '').trim().slice(0, 200) || null;
    const [row] = await sql`
      INSERT INTO media (kind, title, file_key, url, mime_type, size_bytes)
      VALUES (${file.kind}, ${title}, ${file.key}, ${file.url}, ${file.mime}, ${file.size})
      RETURNING *
    `;
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.patch('/media/:id', async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim().slice(0, 200) || null;
    const [row] = await sql`UPDATE media SET title = ${title} WHERE id = ${id(req)} RETURNING *`;
    if (!row) return res.status(404).json({ error: 'File not found.' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/media/:id', async (req, res, next) => {
  try {
    const [row] = await sql`DELETE FROM media WHERE id = ${id(req)} RETURNING file_key`;
    if (!row) return res.status(404).json({ error: 'File not found.' });
    await deleteObject(row.file_key).catch((e) => console.warn('R2 delete failed:', e.message));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
