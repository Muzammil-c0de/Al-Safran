import nodemailer from 'nodemailer';

/**
 * Sends contact-form enquiries to the company inbox (MAIL_TO, default info@alsafran.tech).
 * Two ways, in this order:
 *  1. SMTP (optional) — SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: sends through the mailbox's own login.
 *  2. FormSubmit relay (default, no password needed) — https://formsubmit.co delivers the enquiry to MAIL_TO.
 *     The first enquiry sends an "Activate form" email to MAIL_TO; click its link once.
 */
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
const MAIL_TO = process.env.MAIL_TO || 'info@alsafran.tech';
const SITE_URL = process.env.SITE_URL || 'https://alsafran.tech';

const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
/** Email delivery is on unless explicitly disabled with MAIL_TO=off */
export const mailConfigured = MAIL_TO !== 'off';

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

/** Delivers one enquiry via the FormSubmit relay (no mailbox password needed). */
async function sendViaFormSubmit({ name, email, phone, service, message }) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(MAIL_TO)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: SITE_URL, Referer: `${SITE_URL}/contact` },
    body: JSON.stringify({
      _subject: `New enquiry — ${name}${service ? ` (${service})` : ''}`,
      _template: 'table',
      _captcha: 'false',
      _replyto: email, // pressing Reply answers the customer
      Name: name,
      Email: email,
      Phone: phone || '—',
      Service: service || '—',
      Message: message,
    }),
    signal: AbortSignal.timeout(9000),
  });
  const data = await res.json().catch(() => ({}));
  // FormSubmit answers success:"false" with an "Activate" message until the inbox owner confirms once
  if (!res.ok || String(data.success) !== 'true') {
    throw new Error(`FormSubmit: ${data.message || `HTTP ${res.status}`}`);
  }
}

/** Emails one enquiry to the company inbox. Throws on failure (the caller decides what to do). */
export async function sendEnquiryEmail(enquiry) {
  if (!transport) return sendViaFormSubmit(enquiry);
  const { name, email, phone, service, message } = enquiry;

  const rows = [
    ['Name', name],
    ['Email', `<a href="mailto:${esc(email)}">${esc(email)}</a>`, true],
    ['Phone', phone ? `<a href="tel:${esc(phone)}">${esc(phone)}</a>` : '—', true],
    ['Service', service || '—'],
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
            ([label, value, raw]) => `
        <tr>
          <td style="padding:10px 24px;color:#64748b;width:110px;border-bottom:1px solid #f1f5f9">${label}</td>
          <td style="padding:10px 24px;color:#0e1546;font-weight:bold;border-bottom:1px solid #f1f5f9">${raw ? value : esc(value)}</td>
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

  await transport.sendMail({
    from: { name: 'Al Safran Website', address: SMTP_USER },
    to: MAIL_TO,
    replyTo: { name, address: email },
    subject: `New enquiry — ${name}${service ? ` (${service})` : ''}`,
    text,
    html,
  });
}
