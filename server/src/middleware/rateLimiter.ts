import rateLimit from 'express-rate-limit';

/**
 * General auth rate limiter — login, register, salt lookups
 * 20 requests per 15-minute window per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

/**
 * Strict rate limiter — password recovery, password change
 * 5 requests per 15-minute window per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
