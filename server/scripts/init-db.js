import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

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

await sql`CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC)`;

console.log('✔ Database tables are ready.');
