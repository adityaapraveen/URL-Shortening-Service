// src/app.js
// ─────────────────────────────────────────────────────────────────────────────
// Application entry point.
// ─────────────────────────────────────────────────────────────────────────────

import config from './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { migrate } from './db/migrate.js';
import errorHandler from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import urlRouter from './routes/urls.js';
import redirectRouter from './routes/redirect.js';

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.NODE_ENV === 'production' ? config.BASE_URL : '*',
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
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/urls', urlRouter);

// ─── Redirect Route ───────────────────────────────────────────────────────────
// MUST be mounted last — it catches /:slug which would shadow everything above it
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