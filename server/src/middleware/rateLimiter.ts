import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

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

/**
 * Authenticated API rate limiter — per-user throttling for data endpoints
 * 300 requests per 15-minute window per user (falls back to IP if unauthenticated)
 * Apply AFTER authMiddleware so req.auth is populated
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const accountId = (req as any).auth?.accountId?.toString();
    if (accountId) return accountId;
    return ipKeyGenerator(req.ip || 'unknown');
  },
  message: { error: 'Too many requests, please try again later' },
});

/**
 * Share lookup rate limiter — public share token lookups
 * 30 requests per 15-minute window per IP to prevent brute-force
 */
export const shareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
