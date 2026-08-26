// src/utils/email.js
// Sends emails via SMTP if configured in .env. If not configured yet,
// it falls back to printing the email to the console so you can still
// test the password-reset flow end-to-end during development.

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, text }) {
  const t = getTransporter();

  if (!t) {
    // --- DEV FALLBACK ---
    // No SMTP_HOST/SMTP_USER/SMTP_PASS set in .env yet. Instead of failing,
    // print the email here so you can grab the reset code while testing.
    console.log('\n--- DEV EMAIL (no SMTP configured in .env) ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:\n' + text);
    console.log('-----------------------------------------------\n');
    return;
  }

  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

module.exports = { sendEmail };
