"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendWelcomeEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config/config");
// Create reusable transporter
const transporter = nodemailer_1.default.createTransport({
    host: config_1.config.email.host,
    port: config_1.config.email.port,
    secure: config_1.config.email.secure,
    auth: {
        user: config_1.config.email.user,
        pass: config_1.config.email.password,
    },
});
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${config_1.config.app.frontendUrl}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
        from: config_1.config.email.from,
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
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWelcomeEmail = async (email, firstName) => {
    await transporter.sendMail({
        from: config_1.config.email.from,
        to: email,
        subject: 'Welcome to Our Store!',
        html: `
      <h1>Welcome ${firstName}!</h1>
      <p>Thank you for registering with our store.</p>
      <p>We're excited to have you as a member of our community!</p>
    `,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendVerificationEmail = async (email, verificationToken) => {
    const verifyUrl = `${config_1.config.app.frontendUrl}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
        from: config_1.config.email.from,
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
exports.sendVerificationEmail = sendVerificationEmail;
