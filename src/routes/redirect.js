// The redirect endpoint — the most-hit route in the entire app.
//
// SENIOR DEV NOTE: This is mounted last in app.js because it catches ANY path
// (/:slug). If it were mounted first, it would intercept /api/auth, /health, etc.
// Route order in Express is first-match-wins, so the most specific routes
// must always be registered before wildcard/catch-all routes.
//
// 301 vs 302 — the most consequential decision in a URL shortener:
//
//   301 Moved Permanently — browsers cache this FOREVER.
//     - After the first visit, the browser redirects locally (never hits your server)
//     - Analytics break (you stop seeing clicks)
//     - You can't update or deactivate the link (browser ignores your server)
//     - To undo: user must manually clear browser cache
//
//   302 Found (Temporary) — browsers never cache this.
//     - Every click hits your server
//     - Analytics always work
//     - Deactivating/updating links takes effect immediately
//     - Slightly slower (one extra HTTP round trip) — acceptable trade-off
//
// Always use 302 for URL shorteners.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { resolveSlug } from '../services/urlService.js';
import { recordClick } from '../services/clickService.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

// ─── GET /:slug ───────────────────────────────────────────────────────────────
router.get(
    '/:slug',
    asyncHandler(async (req, res) => {
        const { slug } = req.params;

        // Resolve the slug — throws NotFoundError if not found/expired/inactive
        const url = await resolveSlug(slug);

        // ── Redirect FIRST, record click AFTER ───────────────────────────────
        // Send the redirect immediately. The user starts navigating.
        // Then record the click in the background — user doesn't wait for this.
        res.redirect(302, url.original_url);

        // Fire-and-forget: recordClick handles its own errors internally
        // We do NOT await this — that would make the user wait for DB write
        recordClick(url.id, req);
    })
);

export default router;