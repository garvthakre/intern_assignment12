import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { logger } from './logger.service.js';

// Check if email is properly configured
const isEmailConfigured = () => {
  return process.env.EMAIL_HOST && 
         process.env.EMAIL_HOST !== 'smtp.example.com' && 
         process.env.EMAIL_USER && 
         process.env.EMAIL_USER !== 'your_email@example.com';
};

// Create transporter (conditionally)
let transporter;
if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  logger.warn('Email not configured properly. Using development mode (emails will be logged but not sent)');
}

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (user) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${user.emailVerificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to: user.email,
    subject: 'Email Verification',
    html: `
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `
  };

  // If email is configured, send it; otherwise, log it
  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send verification email: ${error.message}`);
      // Don't throw error - allows the app to continue even if email fails
    }
  } else {
    logger.info(`[DEV MODE] Email would be sent to: ${user.email}`);
    logger.info(`[DEV MODE] Email content: ${mailOptions.html}`);
  }
};