import nodemailer from 'nodemailer';

/**
 * Sends contact-form enquiries to the company inbox (MAIL_TO, default info@alsafran.tech).
 * Uses the first one that is set up:
 *  1. Resend (recommended) — RESEND_API_KEY. Sign up at resend.com with the MAIL_TO address and it can deliver
 *     to that inbox straight away (sender: onboarding@resend.dev). Set MAIL_FROM after verifying the domain.
 *  2. SMTP — SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: sends through the mailbox's own login.
 *  3. FormSubmit relay (backup, often slow) — needs a one-time "Activate Form" click in the MAIL_TO inbox.
 */
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RESEND_API_KEY } = process.env;
const MAIL_TO = process.env.MAIL_TO || 'info@alsafran.tech';
const MAIL_FROM = process.env.MAIL_FROM || 'Al Safran Website <onboarding@resend.dev>';
const SITE_URL = process.env.SITE_URL || 'https://alsafran.tech';

const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
/** Email delivery is on unless explicitly disabled with MAIL_TO=off */
export const mailConfigured = MAIL_TO !== 'off';
/** Which way enquiries are sent (shown in /api/health) */
export const mailMethod = RESEND_API_KEY ? 'resend' : smtpConfigured ? 'smtp' : 'formsubmit';

const port = Number(SMTP_PORT) || 465;
const transport = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL; 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    })
  : null;

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const subjectFor = ({ name, service }) => `New enquiry — ${name}${service ? ` (${service})` : ''}`;

/** The email body: a branded HTML table + a plain-text version. */
function buildEmail({ name, email, phone, service, message }) {
  const rows = [
    ['Name', esc(name)],
    ['Email', `<a href="mailto:${esc(email)}">${esc(email)}</a>`],
    ['Phone', phone ? `<a href="tel:${esc(phone)}">${esc(phone)}</a>` : '—'],
    ['Service', esc(service || '—')],
  ];
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5fb;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#1739a8;color:#ffffff;padding:18px 24px">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.8">alsafran.tech</div>
        <div style="font-size:20px;font-weight:bold;margin-top:4px">New enquiry from the website</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([label, value]) => `
        <tr>
          <td style="padding:10px 24px;color:#64748b;width:110px;border-bottom:1px solid #f1f5f9">${label}</td>
          <td style="padding:10px 24px;color:#0e1546;font-weight:bold;border-bottom:1px solid #f1f5f9">${value}</td>
        </tr>`
          )
          .join('')}
      </table>
      <div style="padding:18px 24px">
        <div style="color:#64748b;font-size:13px;margin-bottom:6px">Message</div>
        <div style="color:#0e1546;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(message)}</div>
      </div>
      <div style="padding:14px 24px;background:#f8fafc;color:#94a3b8;font-size:12px">
        Press <b>Reply</b> to answer ${esc(name)} directly. This enquiry is also saved in Admin → Messages.
      </div>
    </div>
  </div>`;
  const text = `New enquiry from alsafran.tech

Name:    ${name}
Email:   ${email}
Phone:   ${phone || '—'}
Service: ${service || '—'}

${message}

(Reply to this email to answer ${name} directly.)`;
  return { html, text };
}

/** 1. Resend email API */
async function sendViaResend(enquiry) {
  const { html, text } = buildEmail(enquiry);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [MAIL_TO],
      reply_to: enquiry.email, // pressing Reply answers the customer
      subject: subjectFor(enquiry),
      html,
      text,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Resend: ${data.message || `HTTP ${res.status}`}`);
  }
}

/** 2. SMTP through the mailbox's own login */
async function sendViaSmtp(enquiry) {
  const { html, text } = buildEmail(enquiry);
  await transport.sendMail({
    from: { name: 'Al Safran Website', address: SMTP_USER },
    to: MAIL_TO,
    replyTo: { name: enquiry.name, address: enquiry.email },
    subject: subjectFor(enquiry),
    text,
    html,
  });
}

/** 3. FormSubmit relay (backup) */
async function sendViaFormSubmit({ name, email, phone, service, message }) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(MAIL_TO)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: SITE_URL, Referer: `${SITE_URL}/contact` },
    body: JSON.stringify({
      _subject: subjectFor({ name, service }),
      _template: 'table',
      _captcha: 'false',
      _replyto: email,
      Name: name,
      Email: email,
      Phone: phone || '—',
      Service: service || '—',
      Message: message,
    }),
    signal: AbortSignal.timeout(13000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || String(data.success) !== 'true') throw new Error(`FormSubmit: ${data.message || `HTTP ${res.status}`}`);
}

/** Emails one enquiry to the company inbox. Throws on failure (the caller decides what to do). */
export async function sendEnquiryEmail(enquiry) {
  if (mailMethod === 'resend') return sendViaResend(enquiry);
  if (mailMethod === 'smtp') return sendViaSmtp(enquiry);
  return sendViaFormSubmit(enquiry);
}
