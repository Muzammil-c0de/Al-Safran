import { Router } from 'express';
import { sql, requireDb } from '../db.js';
import { mailConfigured, sendEnquiryEmail } from '../mail.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

router.post('/', requireDb, async (req, res, next) => {
  try {
    const name = clean(req.body.name, 120);
    const email = clean(req.body.email, 200);
    const phone = clean(req.body.phone, 40);
    const service = clean(req.body.service, 120);
    const message = clean(req.body.message, 5000);

    // Honeypot field: real users never fill it in.
    if (clean(req.body.company_website, 200)) return res.status(201).json({ ok: true });

    const errors = {};
    if (name.length < 2) errors.name = 'Please enter your name.';
    if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
    if (message.length < 10) errors.message = 'Please tell us a little more (at least 10 characters).';
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', errors });

    await sql`
      INSERT INTO contact_messages (name, email, phone, service, message)
      VALUES (${name}, ${email}, ${phone || null}, ${service || null}, ${message})
    `;

    // Also email it to the company inbox. Awaited (serverless functions stop after responding),
    // but a mail problem never loses the enquiry — it's already saved for Admin → Messages.
    if (mailConfigured) {
      try {
        await sendEnquiryEmail({ name, email, phone, service, message });
      } catch (err) {
        console.error('Enquiry email failed:', err.message);
      }
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
