// config/jwt.js

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';
export const JWT_COOKIE_EXPIRE = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;
