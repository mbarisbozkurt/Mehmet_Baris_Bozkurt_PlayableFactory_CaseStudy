import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../config/config';

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: '7d' 
  };
  return jwt.sign(payload, config.jwt.secret as Secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret as Secret) as TokenPayload & { iat: number; exp: number };
    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided or invalid format');
  }
  return authHeader.split(' ')[1];
};