// Sends a test enquiry to the company inbox (info@alsafran.tech by default).  Usage: npm run mail:check -w server
import 'dotenv/config';
import { sendEnquiryEmail } from '../src/mail.js';

const to = process.env.MAIL_TO || 'info@alsafran.tech';
try {
  await sendEnquiryEmail({
    name: 'Website Test',
    email: 'no-reply@alsafran.tech',
    phone: '052-326 3008',
    service: 'AC Works',
    message: 'This is a test enquiry from the Al Safran website setup. If you can read this, contact-form emails are working.',
  });
  console.log(`✔ Test enquiry delivered to ${to} — check the inbox (and spam folder).`);
} catch (err) {
  console.log(`✘ ${err.message}`);
  if (/activat/i.test(err.message)) {
    console.log(`  → Open ${to}, find the "Activate form" email from FormSubmit and click the link once. Then run this again.`);
  }
  process.exit(1);
}
