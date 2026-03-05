// src/routes/analytics.js

import { Router } from 'express';
import * as analyticsService from '../services/analyticsService.js';
import authenticate from '../middlewares/authenticate.js';
import { asyncHandler, ValidationError } from '../utils/errors.js';

const router = Router();

router.use(authenticate);

// ─── GET /api/analytics/dashboard ────────────────────────────────────────────
// Aggregate stats across all of the user's URLs.
// Used for the main dashboard overview panel.
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats(req.user.id);
    res.status(200).json({ success: true, data: stats });
  })
);

// ─── GET /api/analytics/:urlId ────────────────────────────────────────────────
// Summary stats for a single URL: total clicks, unique visitors,
// device breakdown, top referrers.
router.get(
  '/:urlId',
  asyncHandler(async (req, res) => {
    const stats = await analyticsService.getUrlStats(req.params.urlId, req.user.id);
    res.status(200).json({ success: true, data: stats });
  })
);

// ─── GET /api/analytics/:urlId/timeseries ─────────────────────────────────────
// Clicks grouped by day for charting.
// Query param: ?days=30 (default 30, max 365)
router.get(
  '/:urlId/timeseries',
  asyncHandler(async (req, res) => {
    let days = parseInt(req.query.days, 10) || 30;

    // Cap the range — unbounded queries on large click tables are expensive
    if (days < 1 || days > 365) {
      throw new ValidationError('days must be between 1 and 365.');
    }

    const data = await analyticsService.getClicksOverTime(
      req.params.urlId,
      req.user.id,
      days
    );

    res.status(200).json({ success: true, data });
  })
);

export default router;