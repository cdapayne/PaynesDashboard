import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
      req.user = decoded;
    } catch {
      // Token invalid, but continue without authentication
    }
  }

  next();
};
