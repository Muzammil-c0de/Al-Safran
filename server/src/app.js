// The API as an Express app — shared by the local server (src/index.js) and the Vercel function (api/index.js).
// Environment variables must be loaded before this file is imported.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { sql } from './db.js';
import { r2Configured, storageProblem } from './r2.js';
import { mailConfigured, mailMethod } from './mail.js';
import contactRoutes from './routes/contact.js';
import projectRoutes from './routes/projects.js';
import adminRoutes from './routes/admin.js';
import mediaRoutes from './routes/media.js';
import fileRoutes from './routes/files.js';
import { publicBanners, adminBanners } from './routes/banners.js';

const app = express();

app.set('trust proxy', 1);
// cross-origin resource policy: lets the website show images/videos served by this API from another domain
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
  })
);
app.use(express.json({ limit: '200kb' }));

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
  // Real R2 test, so a wrong key/secret shows up here instead of as broken images
  const storageError = r2Configured ? await storageProblem() : 'NotConfigured';
  res.json({ ok: true, database, storage: !storageError, ...(storageError ? { storageError } : {}), mail: mailConfigured ? mailMethod : false });
});

const limit = (max) => rateLimit({ windowMs: 15 * 60 * 1000, limit: max });

app.use('/api/contact', limit(10), contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/files', fileRoutes); // images stored in R2 (used when no public R2 URL is set)
app.use('/api/banners', publicBanners);
app.use('/api/admin/banners', limit(200), adminBanners);
app.use('/api/admin', limit(200), adminRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on our side.' : err.message });
});

export default app;
