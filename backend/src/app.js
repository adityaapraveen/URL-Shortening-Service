// src/app.js
// ─────────────────────────────────────────────────────────────────────────────
// Application entry point — final production version.
// ─────────────────────────────────────────────────────────────────────────────

import config from './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { migrate } from './db/migrate.js';
import errorHandler from './middlewares/errorHandler.js';
import { authLimiter, apiLimiter } from './middlewares/rateLimiter.js';

import authRouter from './routes/auth.js';
import urlRouter from './routes/urls.js';
import analyticsRouter from './routes/analytics.js';
import redirectRouter from './routes/redirect.js';

const app = express();

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
// CRITICAL for Render deployment. Without this, req.ip is always the proxy's
// IP address — rate limiting breaks (everyone looks like the same IP).
// '1' means trust exactly one proxy hop (Render's load balancer).
if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.NODE_ENV === 'production' ? config.FRONTEND_URL : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health Check ─────────────────────────────────────────────────────────────
// No rate limiting on health — Render's uptime monitor calls this frequently.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
// Auth gets the strict limiter (5 req/15min) — brute force protection
app.use('/api/auth', authLimiter, authRouter);

// All other API routes get the general limiter (100 req/15min)
app.use('/api/urls', apiLimiter, urlRouter);
app.use('/api/analytics', apiLimiter, analyticsRouter);

// ─── Redirect Route ───────────────────────────────────────────────────────────
// No auth, no API rate limit — redirects must be publicly accessible and fast.
// We don't rate-limit redirects here: a URL going viral shouldn't be throttled.
// DDoS protection at this scale is handled at the infrastructure level (Render/CDN).
// MUST be mounted last — /:slug catches everything.
app.use('/', redirectRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await migrate();
    app.listen(config.PORT, () => {
      console.log(`[App] Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      console.log(`[App] Base URL: ${config.BASE_URL}`);
    });
  } catch (err) {
    console.error('[App] Failed to start:', err.message);
    process.exit(1);
  }
}

bootstrap();

export default app;