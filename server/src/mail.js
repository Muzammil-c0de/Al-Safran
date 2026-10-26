import nodemailer from 'nodemailer';

/**
 * Sends contact-form enquiries to the company inbox, using the mailbox's own SMTP login.
 * Settings (server/.env and Vercel): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO (defaults to SMTP_USER).
 */
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;

export const mailConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const port = Number(SMTP_PORT) || 465;
const transport = mailConfigured
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

/** Emails one enquiry. Throws on failure (the caller decides what to do). */
export async function sendEnquiryEmail({ name, email, phone, service, message }) {
  if (!transport) throw new Error('Email is not configured (SMTP settings missing).');

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
    to: MAIL_TO || SMTP_USER,
    replyTo: { name, address: email },
    subject: `New enquiry — ${name}${service ? ` (${service})` : ''}`,
    text,
    html,
  });
}
