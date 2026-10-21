# Al Safran — Company Website

| Part | Tech |
|------|------|
| Frontend (`client/`) | React 18 + TypeScript + Vite + Tailwind CSS v4 + React Router |
| Backend (`server/`) | Node.js (JavaScript) + Express |
| Database | Neon (serverless Postgres) — contact messages & projects |
| Storage | Cloudflare R2 — project images |

Pages: **Home · Services · About Us · Projects · Contact**, plus a hidden **`/admin`** page to add projects
(uploads images to R2) and read contact-form messages.

## 1. Install

```bash
npm install
```

## 2. Configure

```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:

- **Neon** → create a project at neon.tech, copy the connection string into `DATABASE_URL`.
- **Cloudflare R2** → create a bucket, enable *Public access* (r2.dev URL or custom domain) and put that
  URL in `R2_PUBLIC_URL`. Create an R2 API token (Object Read & Write) for `R2_ACCESS_KEY_ID` /
  `R2_SECRET_ACCESS_KEY`. Your account ID is shown on the R2 overview page.
- **ADMIN_TOKEN** → any long random string; you'll use it to log in at `/admin`.

Create the database tables (once):

```bash
npm run db:init
```

## 3. Add your logo

Put it at `client/public/logo.png`.

## 4. Edit company details

Phone, email, address, hours, WhatsApp and stats live in `client/src/data/site.ts`.
Service texts are in `client/src/data/services.ts`. Brand colours are at the top of `client/src/index.css`.

## 5. Run

```bash
npm run dev
```

- Website: http://localhost:5173
- API: http://localhost:5000/api/health

## Production

```bash
npm run build   # builds client/dist
npm start       # Express serves the API and the built site on one port
```

Deploy to any Node host (Render, Railway, a VPS, etc.) and set the same environment variables there.
