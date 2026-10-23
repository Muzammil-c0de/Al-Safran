import { Router } from 'express';
import { getObject } from '../r2.js';

const router = Router();

// Only files the admin panel uploads live in these folders
const KEY_PATTERN = /^(images|videos|projects|banners)\/[\w.-]+$/;

/**
 * Streams a stored image/video from Cloudflare R2: GET /api/files/images/123-abc.webp
 * Supports Range requests so videos can start quickly and be scrubbed.
 */
router.get('/*', async (req, res, next) => {
  const key = req.params[0];
  if (!KEY_PATTERN.test(key)) return res.status(404).json({ error: 'Not found' });
  try {
    const obj = await getObject(key, req.headers.range);
    res.status(obj.ContentRange ? 206 : 200);
    if (obj.ContentType) res.set('Content-Type', obj.ContentType);
    if (obj.ContentLength != null) res.set('Content-Length', String(obj.ContentLength));
    if (obj.ContentRange) res.set('Content-Range', obj.ContentRange);
    if (obj.ETag) res.set('ETag', obj.ETag);
    res.set('Accept-Ranges', 'bytes');
    // Uploaded files never change (each upload gets a new name), so browsers can cache them for a year
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    obj.Body.pipe(res);
  } catch (err) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) return res.status(404).json({ error: 'Not found' });
    if (err?.$metadata?.httpStatusCode === 416) return res.status(416).end();
    next(err);
  }
});

export default router;
