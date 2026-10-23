// Local / self-hosted server: loads .env, serves the API (and the built site if present) on one port.
// On Vercel the same API runs as a function instead — see /api/index.js.
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import app from './app.js';
import { sql } from './db.js';
import { r2Configured } from './r2.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;

// Serve the built React app from the same server when it exists (npm run build)
const dist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(dist)) {
  const server = express();
  server.use(app);
  server.use(express.static(dist));
  server.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  server.listen(PORT, ready);
} else {
  app.listen(PORT, ready);
}

function ready() {
  console.log(`API running on http://localhost:${PORT}`);
  if (!sql) console.warn('⚠  DATABASE_URL not set — contact form and projects API are disabled.');
  if (!r2Configured) console.warn('⚠  R2 not configured — image/video uploads are disabled.');
  if (!process.env.SESSION_SECRET) console.warn('⚠  SESSION_SECRET not set — admin login is disabled.');
}
