import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

import { sql } from './db.js';
import { r2Configured } from './r2.js';
import contactRoutes from './routes/contact.js';
import projectRoutes from './routes/projects.js';
import adminRoutes from './routes/admin.js';
import mediaRoutes from './routes/media.js';
import fileRoutes from './routes/files.js';
import { publicBanners, adminBanners } from './routes/banners.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
// cross-origin resource policy: lets the website (e.g. on Vercel) show images/videos served by this API
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
  })
);
app.use(express.json({ limit: '100kb' }));

// Reports whether the database actually answers and R2 has real (non-placeholder) settings
app.get('/api/health', async (req, res) => {
  let database = false;
  if (sql) {
    try {
      await sql`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }
  }
  const storage = r2Configured;
  res.json({ ok: true, database, storage });
});

app.use('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }), contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/files', fileRoutes); // images/videos stored in R2
app.use('/api/banners', publicBanners);
app.use('/api/admin/banners', rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }), adminBanners);
app.use('/api/admin', rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }), adminRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// In production, serve the built React app from the same server.
const dist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (images up to 10 MB, videos up to 100 MB).' : err.message });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on our side.' : err.message });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  if (!sql) console.warn('⚠  DATABASE_URL not set — contact form and projects API are disabled.');
  if (!r2Configured) console.warn('⚠  R2 not configured — image/video uploads are disabled.');
  if (!process.env.SESSION_SECRET) console.warn('⚠  SESSION_SECRET not set — admin login is disabled.');
});
