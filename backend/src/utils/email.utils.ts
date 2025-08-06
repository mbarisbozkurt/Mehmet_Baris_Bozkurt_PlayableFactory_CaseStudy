import nodemailer from 'nodemailer';
import { config } from '../config/config';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  });
};

export const sendWelcomeEmail = async (
  email: string,
  firstName: string
) => {
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Welcome to Our Store!',
    html: `
      <h1>Welcome ${firstName}!</h1>
      <p>Thank you for registering with our store.</p>
      <p>We're excited to have you as a member of our community!</p>
    `,
  });
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  const verifyUrl = `${config.app.frontendUrl}/verify-email?token=${verificationToken}`;
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h1>Email Verification</h1>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  });
};