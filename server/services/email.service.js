import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (user) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${user.emailVerificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Email Verification',
    html: `
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `
  };

  await transporter.sendMail(mailOptions);
};
