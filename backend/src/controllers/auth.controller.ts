import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User, { IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email.utils';

type UserWithId = IUser & { _id: mongoose.Types.ObjectId };

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Validate password
    if (!password || password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role: 'customer'
    }) as UserWithId;

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

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
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }) as UserWithId | null;
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken({
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
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }) as UserWithId | null;
    if (!user) {
      // Don't reveal whether a user exists
      return res.json({
        status: 'success',
        message: 'If an account exists, you will receive a password reset email'
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).slice(-8);
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      status: 'success',
      message: 'If an account exists, you will receive a password reset email'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: { $exists: true },
      resetPasswordExpires: { $gt: Date.now() }
    }) as UserWithId | null;

    if (!user || !user.resetPasswordToken) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    // Verify token
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      throw new AppError(400, 'Invalid or expired reset token');
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
  } catch (error) {
    next(error);
  }
};