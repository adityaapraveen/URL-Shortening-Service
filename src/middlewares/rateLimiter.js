// src/middleware/rateLimiter.js
// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting middleware.
//
// SENIOR DEV NOTE: Rate limiting is non-negotiable for auth endpoints.
// Without it, an attacker can try millions of passwords against any account.
// bcrypt's slowness helps (each check takes ~100ms), but a determined attacker
// with a botnet can still run thousands of attempts per hour across IPs.
//
// Two limiters with different configs:
//
//   authLimiter — strict, for login/register
//     5 requests per 15 minutes per IP.
//     Reasoning: a legitimate user won't need to log in 6 times in 15 minutes.
//     An attacker trying a password list absolutely will.
//
//   apiLimiter — general, for all other API endpoints
//     100 requests per 15 minutes per IP.
//     Prevents scraping, automated abuse, and runaway clients.
//
// SENIOR DEV NOTE ON HEADERS:
// standardHeaders: true  → sends RateLimit-* headers (RFC 6585 standard)
// legacyHeaders: false   → suppresses the old X-RateLimit-* headers
// Modern clients read the standard headers. No reason to send both.
//
// ON RENDER (behind a proxy):
// express-rate-limit reads req.ip by default. Behind a proxy, req.ip is the
// proxy's IP — every user appears to come from the same IP, breaking the limiter.
// Setting `trustProxy` in Express makes it read X-Forwarded-For instead.
// We handle this in app.js with `app.set('trust proxy', 1)`.
// ─────────────────────────────────────────────────────────────────────────────

import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

// ─── Auth Rate Limiter ────────────────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many attempts. Please try again in 15 minutes.',
  },
  // Skip rate limiting in test environments
  skip: () => config.NODE_ENV === 'test',
});

// ─── General API Rate Limiter ─────────────────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
  skip: () => config.NODE_ENV === 'test',
});