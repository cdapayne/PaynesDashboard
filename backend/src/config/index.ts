import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
