"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_utils_1 = require("../utils/jwt.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const email_utils_1 = require("../utils/email.utils");
const crypto_1 = __importDefault(require("crypto"));
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        // Validate password
        if (!password || password.length < 6) {
            throw new error_middleware_1.AppError(400, 'Password must be at least 6 characters long');
        }
        // Check if user already exists
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            throw new error_middleware_1.AppError(400, 'Email already registered');
        }
        // Generate email verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Create new user
        const user = await user_model_1.default.create({
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            role: 'customer',
            isEmailVerified: false,
            verificationToken,
        });
        // Generate token
        const token = (0, jwt_utils_1.generateToken)({
            userId: user._id.toString(),
            role: user.role
        });
        // Send welcome email
        await (0, email_utils_1.sendWelcomeEmail)(user.email, user.firstName);
        // Send verification email
        await (0, email_utils_1.sendVerificationEmail)(user.email, verificationToken);
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                token
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new error_middleware_1.AppError(401, 'Invalid credentials');
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new error_middleware_1.AppError(401, 'Invalid credentials');
        }
        // Check if email is verified
        if (!user.isEmailVerified) {
            throw new error_middleware_1.AppError(401, 'Please verify your email before logging in');
        }
        // Generate token
        const token = (0, jwt_utils_1.generateToken)({
            userId: user._id.toString(),
            role: user.role
        });
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                token
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            // Don't reveal whether a user exists
            return res.json({
                status: 'success',
                message: 'If an account exists, you will receive a password reset email'
            });
        }
        // Generate reset token
        const resetToken = Math.random().toString(36).slice(-8);
        const resetTokenHash = await bcryptjs_1.default.hash(resetToken, 10);
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        // Send password reset email
        await (0, email_utils_1.sendPasswordResetEmail)(user.email, resetToken);
        res.json({
            status: 'success',
            message: 'If an account exists, you will receive a password reset email'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        // Find user with valid reset token
        const user = await user_model_1.default.findOne({
            resetPasswordToken: { $exists: true },
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user || !user.resetPasswordToken) {
            throw new error_middleware_1.AppError(400, 'Invalid or expired reset token');
        }
        // Verify token
        const isTokenValid = await bcryptjs_1.default.compare(token, user.resetPasswordToken);
        if (!isTokenValid) {
            throw new error_middleware_1.AppError(400, 'Invalid or expired reset token');
        }
        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({
            status: 'success',
            message: 'Password has been reset successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
// Email verification controller
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            throw new error_middleware_1.AppError(400, 'Verification token is required');
        }
        // Find user with the given verification token
        const user = await user_model_1.default.findOne({ verificationToken: token });
        if (!user) {
            throw new error_middleware_1.AppError(400, 'Invalid or expired verification token');
        }
        // Mark user as verified and clear the token
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.json({ status: 'success', message: 'Email verified successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
