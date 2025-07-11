import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  // @ts-ignore - jwt.sign typing issue with custom options
  return jwt.sign(
    { 
      userId: payload.userId, 
      email: payload.email, 
      role: payload.role,
      tokenType: 'access'
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'user-management-api',
      audience: 'api-users'
    }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const generateRefreshToken = (): string => {
  // @ts-ignore - jwt.sign typing issue with custom options
  return jwt.sign(
    { 
      type: 'refresh',
      tokenType: 'refresh'
    },
    JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'user-management-api',
      audience: 'api-users'
    }
  );
};