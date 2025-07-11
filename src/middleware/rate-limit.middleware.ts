import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export const generalLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request): boolean => {
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1');
  },
  keyGenerator: (req: Request): string => {
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  },
});

