import nodemailer from 'nodemailer';
import { CONFIG } from '../config/config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.GMAIL_USER,
    pass: CONFIG.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error('Gmail SMTP connection failed:', err.message);
  } else {
    console.log('Gmail SMTP ready to send emails');
  }
});

async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"CLOTHINGG" <${CONFIG.GMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    return info;
  } catch (err) {
    throw new Error(`Failed to send email to ${to}: ${err.message}`);
  }
}

export default sendMail;