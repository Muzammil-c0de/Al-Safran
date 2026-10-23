import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { hashPassword } from '../src/auth.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    service     TEXT,
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;
await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false`;

await sql`
  CREATE TABLE IF NOT EXISTS projects (
    id            SERIAL PRIMARY KEY,
    title         TEXT NOT NULL,
    category      TEXT NOT NULL,
    location      TEXT,
    description   TEXT,
    image_key     TEXT,
    image_url     TEXT,
    completed_on  DATE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// Images and videos uploaded from the admin panel (stored in Cloudflare R2)
await sql`
  CREATE TABLE IF NOT EXISTS media (
    id          SERIAL PRIMARY KEY,
    kind        TEXT NOT NULL CHECK (kind IN ('image', 'video')),
    title       TEXT,
    file_key    TEXT NOT NULL,
    url         TEXT NOT NULL,
    mime_type   TEXT NOT NULL,
    size_bytes  BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// Home page slider banners (managed from Admin → Banners). Images live in R2.
await sql`
  CREATE TABLE IF NOT EXISTS banners (
    id            SERIAL PRIMARY KEY,
    eyebrow       TEXT,
    title         TEXT NOT NULL,
    subtitle      TEXT,
    button_label  TEXT,
    button_link   TEXT,
    desktop_key   TEXT NOT NULL,
    desktop_url   TEXT NOT NULL,
    mobile_key    TEXT,
    mobile_url    TEXT,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS admin_users (
    id             SERIAL PRIMARY KEY,
    username       TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC)`;
await sql`CREATE INDEX IF NOT EXISTS media_created_idx ON media (created_at DESC)`;

// Create / reset the admin login from ADMIN_USERNAME + ADMIN_PASSWORD (if set)
const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
if (ADMIN_USERNAME && ADMIN_PASSWORD) {
  if (ADMIN_PASSWORD.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }
  await sql`
    INSERT INTO admin_users (username, password_hash)
    VALUES (${ADMIN_USERNAME}, ${hashPassword(ADMIN_PASSWORD)})
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
  console.log(`✔ Admin user "${ADMIN_USERNAME}" is ready.`);
} else {
  console.log('ℹ  Set ADMIN_USERNAME and ADMIN_PASSWORD in .env and run this again to create the admin login.');
}

console.log('✔ Database tables are ready.');
