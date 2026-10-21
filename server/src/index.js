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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
  })
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) =>
  res.json({ ok: true, database: Boolean(sql), storage: r2Configured })
);

app.use('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }), contactRoutes);
app.use('/api/projects', projectRoutes);
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
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 8 MB.' : err.message });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on our side.' : err.message });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  if (!sql) console.warn('⚠  DATABASE_URL not set — contact form and projects API are disabled.');
  if (!r2Configured) console.warn('⚠  R2 not configured — image uploads are disabled.');
});
