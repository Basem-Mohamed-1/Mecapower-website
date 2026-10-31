import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_RECIPIENT } = process.env;
const emailConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_FROM && CONTACT_RECIPIENT);
const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      ...(SMTP_USER && SMTP_PASS ? { auth: { user: SMTP_USER, pass: SMTP_PASS } } : {}),
    })
  : null;

export async function sendLeadNotification(lead) {
  if (!transporter) {
    console.warn('Lead notification email skipped: configure SMTP_* and CONTACT_* environment variables.');
    return false;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to: CONTACT_RECIPIENT,
    replyTo: lead.email,
    subject: 'New Contact Request – Ultra',
    text: [
      'A new contact request was submitted on the Ultra website.',
      '',
      `Full Name: ${lead.full_name}`,
      `Phone Number: ${lead.phone_number}`,
      `Email: ${lead.email}`,
      `Service Required: ${lead.service_required}`,
      `Submission Date: ${lead.created_at}`,
    ].join('\n'),
  });
  return true;
}
