// Sends a test enquiry email using the SMTP settings in .env.  Usage: npm run mail:check -w server
import 'dotenv/config';
import { mailConfigured, sendEnquiryEmail } from '../src/mail.js';

if (!mailConfigured) {
  console.log('✘ SMTP_HOST, SMTP_USER and SMTP_PASS must be set in server/.env');
  process.exit(1);
}
try {
  await sendEnquiryEmail({
    name: 'Website Test',
    email: process.env.SMTP_USER,
    phone: '052-326 3008',
    service: 'AC Works',
    message: 'This is a test enquiry from the Al Safran website setup. If you can read this, contact-form emails are working.',
  });
  console.log(`✔ Test email sent to ${process.env.MAIL_TO || process.env.SMTP_USER} — check the inbox (and spam folder).`);
} catch (err) {
  console.log(`✘ Sending failed: ${err.message}`);
  process.exit(1);
}
