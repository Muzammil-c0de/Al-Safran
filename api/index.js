// Vercel serverless function: runs the Al Safran API (server/src/app.js) at https://alsafran.tech/api/*
// Environment variables (DATABASE_URL, R2_*, SESSION_SECRET, ADMIN_*) are set in Vercel → Settings → Environment Variables.
import app from '../server/src/app.js';

export default app;
