import { Router } from 'express';
import { sql, requireDb } from '../db.js';
import { requireAdmin } from '../auth.js';
import { deleteObject, verifyUpload } from '../r2.js';

// Banner images are uploaded by the browser straight to R2 (POST /api/admin/uploads, folder "banners");
// these routes receive their keys as `desktop_key` / `mobile_key`.

/** Checks an uploaded banner image key; returns null when not given. */
async function bannerImage(key) {
  if (!key) return null;
  const file = await verifyUpload(key, ['banners']);
  if (file.kind !== 'image') throw Object.assign(new Error('Banners must be images.'), { status: 400 });
  return file;
}

const text = (v, max) => {
  const s = String(v ?? '').trim().slice(0, max);
  return s || null;
};

/** Only allow site paths ("/contact", "/services#ducting") or full http(s) links. */
const link = (v) => {
  const s = text(v, 300);
  if (!s) return null;
  return /^(\/[^\s]*|https?:\/\/[^\s]+)$/.test(s) ? s : null;
};

// ---------------- Public ----------------

export const publicBanners = Router();

publicBanners.get('/', requireDb, async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT id, eyebrow, title, subtitle, button_label, button_link, desktop_url, mobile_url
      FROM banners WHERE is_active
      ORDER BY sort_order, id
    `;
    res.set('Cache-Control', 'public, max-age=60');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------------- Admin ----------------

export const adminBanners = Router();
adminBanners.use(requireAdmin, requireDb);

adminBanners.get('/', async (req, res, next) => {
  try {
    res.json(await sql`SELECT * FROM banners ORDER BY sort_order, id`);
  } catch (err) {
    next(err);
  }
});

adminBanners.post('/', async (req, res, next) => {
  const uploaded = [req.body.desktop_key, req.body.mobile_key].filter(Boolean);
  try {
    const title = text(req.body.title, 160);
    if (!title) return res.status(400).json({ error: 'Add a heading for the banner.' });
    if (!req.body.desktop_key) return res.status(400).json({ error: 'Choose the desktop banner image.' });

    const d = await bannerImage(req.body.desktop_key);
    const m = await bannerImage(req.body.mobile_key);

    const [{ next: order }] = await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM banners`;
    const [row] = await sql`
      INSERT INTO banners (eyebrow, title, subtitle, button_label, button_link, desktop_key, desktop_url, mobile_key, mobile_url, sort_order, is_active)
      VALUES (${text(req.body.eyebrow, 80)}, ${title}, ${text(req.body.subtitle, 300)}, ${text(req.body.button_label, 40)},
              ${link(req.body.button_link)}, ${d.key}, ${d.url}, ${m?.key ?? null}, ${m?.url ?? null}, ${order}, ${req.body.is_active !== 'false'})
      RETURNING *
    `;
    res.status(201).json(row);
  } catch (err) {
    // Don't leave orphaned files in R2 if saving failed
    await Promise.all(uploaded.map((k) => deleteObject(k).catch(() => {})));
    next(err);
  }
});

adminBanners.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [current] = await sql`SELECT * FROM banners WHERE id = ${id}`;
    if (!current) return res.status(404).json({ error: 'Banner not found.' });

    const b = req.body;
    const has = (k) => Object.prototype.hasOwnProperty.call(b, k);
    const removeMobile = String(b.remove_mobile) === 'true';

    const d = await bannerImage(b.desktop_key);
    const m = await bannerImage(b.mobile_key);

    const title = has('title') ? text(b.title, 160) : current.title;
    if (!title) return res.status(400).json({ error: 'The banner needs a heading.' });

    const [row] = await sql`
      UPDATE banners SET
        eyebrow      = ${has('eyebrow') ? text(b.eyebrow, 80) : current.eyebrow},
        title        = ${title},
        subtitle     = ${has('subtitle') ? text(b.subtitle, 300) : current.subtitle},
        button_label = ${has('button_label') ? text(b.button_label, 40) : current.button_label},
        button_link  = ${has('button_link') ? link(b.button_link) : current.button_link},
        is_active    = ${has('is_active') ? String(b.is_active) !== 'false' : current.is_active},
        sort_order   = ${has('sort_order') ? Number(b.sort_order) || 0 : current.sort_order},
        desktop_key  = ${d ? d.key : current.desktop_key},
        desktop_url  = ${d ? d.url : current.desktop_url},
        mobile_key   = ${m ? m.key : removeMobile ? null : current.mobile_key},
        mobile_url   = ${m ? m.url : removeMobile ? null : current.mobile_url}
      WHERE id = ${id}
      RETURNING *
    `;

    // Remove replaced images from R2
    if (d) await deleteObject(current.desktop_key).catch(() => {});
    if ((m || removeMobile) && current.mobile_key) await deleteObject(current.mobile_key).catch(() => {});
    res.json(row);
  } catch (err) {
    next(err);
  }
});

/** Swap a banner with its neighbour: { direction: "up" | "down" } */
adminBanners.post('/:id/move', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const all = await sql`SELECT id FROM banners ORDER BY sort_order, id`;
    const i = all.findIndex((r) => r.id === id);
    const j = req.body.direction === 'up' ? i - 1 : i + 1;
    if (i < 0) return res.status(404).json({ error: 'Banner not found.' });
    if (j >= 0 && j < all.length) [all[i], all[j]] = [all[j], all[i]];
    // Re-number 1..n in the new order
    for (const [n, r] of all.entries()) await sql`UPDATE banners SET sort_order = ${n + 1} WHERE id = ${r.id}`;
    res.json(await sql`SELECT * FROM banners ORDER BY sort_order, id`);
  } catch (err) {
    next(err);
  }
});

adminBanners.delete('/:id', async (req, res, next) => {
  try {
    const [row] = await sql`DELETE FROM banners WHERE id = ${Number(req.params.id)} RETURNING desktop_key, mobile_key`;
    if (!row) return res.status(404).json({ error: 'Banner not found.' });
    await Promise.all([row.desktop_key, row.mobile_key].filter(Boolean).map((k) => deleteObject(k).catch(() => {})));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
