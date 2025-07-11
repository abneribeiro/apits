import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import logger from '../utils/logger';

const sanitizeLogData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'refreshToken', 'currentPassword', 'newPassword'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    url: req.url,
    method: req.method,
    body: sanitizeLogData(req.body),
    params: req.params,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = 'Internal server error';

  if (error.message.includes('already exists')) {
    statusCode = 409;
    message = error.message;
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = error.message;
  } else if (error.message.includes('Invalid credentials') || error.message.includes('incorrect')) {
    statusCode = 401;
    message = error.message;
  } else if (error.message.includes('Insufficient permissions') || error.message.includes('deactivated')) {
    statusCode = 403;
    message = error.message;
  } else if (error.message.includes('required') || error.message.includes('invalid')) {
    statusCode = 400;
    message = error.message;
  }

  sendError(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};