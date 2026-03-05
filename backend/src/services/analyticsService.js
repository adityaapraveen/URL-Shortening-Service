// Analytics business logic.
//
// SENIOR DEV NOTE: Analytics queries are where SQL really earns its keep.
// The temptation is to fetch all clicks and process them in JavaScript —
// that works at 100 clicks but breaks at 1,000,000. Always push aggregation
// work into the database. SQLite handles GROUP BY, COUNT, and conditional
// aggregates far more efficiently than JS array methods ever could.
//
// Key SQL techniques used here:
//   - Conditional aggregation: COUNT(CASE WHEN condition THEN 1 END)
//     Gets multiple breakdowns in one pass over the table — no N queries.
//   - strftime(): SQLite's date formatting for time-series grouping.
//   - LEFT JOIN with GROUP BY: avoids N+1 for click counts.
//   - Ownership check in every query: users can only see their own data.

import db from '../db/connection.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Verifies a URL exists and belongs to the user.
 * Called before every analytics query as an ownership + existence guard.
 */
async function assertUrlOwnership(urlId, userId) {
  const url = await db.getAsync(
    'SELECT id, slug, original_url, title FROM urls WHERE id = ? AND user_id = ?',
    [urlId, userId]
  );
  if (!url) throw new NotFoundError('URL not found.');
  return url;
}

// ─── Analytics Functions 

/**
 * Summary stats for a single URL.
 * Returns total clicks, unique IPs, device breakdown, and top referrers
 * all in TWO queries — not N queries.
 */
export async function getUrlStats(urlId, userId) {
  const url = await assertUrlOwnership(urlId, userId);

  // ── Query 1: Aggregate summary ────────────────────────────────────────────
  // Conditional aggregation: one pass over the clicks table, multiple metrics.
  // COUNT(DISTINCT ...) for unique visitors — not perfect (shared IPs, NAT)
  // but the standard approximation used everywhere.
  const summary = await db.getAsync(
    `SELECT
       COUNT(*)                                          AS total_clicks,
       COUNT(DISTINCT ip_address)                        AS unique_visitors,
       COUNT(CASE WHEN device_type = 'mobile'  THEN 1 END) AS mobile_clicks,
       COUNT(CASE WHEN device_type = 'tablet'  THEN 1 END) AS tablet_clicks,
       COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) AS desktop_clicks,
       COUNT(CASE WHEN device_type = 'unknown' THEN 1 END) AS unknown_clicks,
       MIN(clicked_at)                                   AS first_click_at,
       MAX(clicked_at)                                   AS last_click_at
     FROM clicks
     WHERE url_id = ?`,
    [urlId]
  );

  // ── Query 2: Top referrers ────────────────────────────────────────────────
  // NULL referer = direct traffic (typed URL, bookmark, no referrer header)
  const referrers = await db.allAsync(
    `SELECT
       COALESCE(referer, 'Direct') AS source,
       COUNT(*)                    AS clicks
     FROM clicks
     WHERE url_id = ?
     GROUP BY referer
     ORDER BY clicks DESC
     LIMIT 10`,
    [urlId]
  );

  return {
    url: {
      id: url.id,
      slug: url.slug,
      original_url: url.original_url,
      title: url.title,
    },
    summary: {
      total_clicks:    summary.total_clicks    || 0,
      unique_visitors: summary.unique_visitors || 0,
      first_click_at:  summary.first_click_at  || null,
      last_click_at:   summary.last_click_at   || null,
      devices: {
        mobile:  summary.mobile_clicks  || 0,
        tablet:  summary.tablet_clicks  || 0,
        desktop: summary.desktop_clicks || 0,
        unknown: summary.unknown_clicks || 0,
      },
    },
    referrers,
  };
}

/**
 * Click counts grouped by day for a given date range.
 * Used to render the clicks-over-time chart on the dashboard.
 *
 * SENIOR DEV NOTE: strftime('%Y-%m-%d', clicked_at, 'unixepoch') converts
 * Unix timestamps to 'YYYY-MM-DD' strings for grouping. The 'unixepoch'
 * modifier tells SQLite the input is seconds since epoch (which it is —
 * that's how we store all timestamps).
 *
 * @param {string} urlId
 * @param {string} userId
 * @param {number} days   - How many days back to look (default 30)
 */
export async function getClicksOverTime(urlId, userId, days = 30) {
  await assertUrlOwnership(urlId, userId);

  // Calculate the cutoff timestamp (seconds since epoch)
  const cutoff = Math.floor(Date.now() / 1000) - days * 86400;

  const rows = await db.allAsync(
    `SELECT
       strftime('%Y-%m-%d', clicked_at, 'unixepoch') AS date,
       COUNT(*)                                        AS clicks
     FROM clicks
     WHERE url_id = ?
       AND clicked_at >= ?
     GROUP BY date
     ORDER BY date ASC`,
    [urlId, cutoff]
  );

  // SENIOR DEV NOTE: The query only returns days that have clicks.
  // If there are no clicks on 2024-01-03, that date won't appear in results.
  // For a chart, you want every day in the range — even zero-click days.
  // We fill the gaps here in JavaScript (cheaper than a recursive CTE in SQLite).
  return fillDateGaps(rows, days);
}

/**
 * Dashboard overview — aggregate stats across ALL of a user's URLs.
 * Gives the top-level numbers for the main dashboard view.
 */
export async function getDashboardStats(userId) {
  // Total URLs created
  const urlCount = await db.getAsync(
    'SELECT COUNT(*) AS total FROM urls WHERE user_id = ?',
    [userId]
  );

  // Overall click stats across all URLs
  const clickStats = await db.getAsync(
    `SELECT
       COUNT(*)                   AS total_clicks,
       COUNT(DISTINCT ip_address) AS unique_visitors
     FROM clicks c
     INNER JOIN urls u ON u.id = c.url_id
     WHERE u.user_id = ?`,
    [userId]
  );

  // Top 5 performing URLs by click count
  const topUrls = await db.allAsync(
    `SELECT
       u.id,
       u.slug,
       u.original_url,
       u.title,
       COUNT(c.id) AS click_count
     FROM urls u
     LEFT JOIN clicks c ON c.url_id = u.id
     WHERE u.user_id = ?
     GROUP BY u.id
     ORDER BY click_count DESC
     LIMIT 5`,
    [userId]
  );

  // Clicks in the last 7 days (for a "recent activity" indicator)
  const cutoff7d = Math.floor(Date.now() / 1000) - 7 * 86400;
  const recentClicks = await db.getAsync(
    `SELECT COUNT(*) AS clicks
     FROM clicks c
     INNER JOIN urls u ON u.id = c.url_id
     WHERE u.user_id = ?
       AND c.clicked_at >= ?`,
    [userId, cutoff7d]
  );

  return {
    total_urls:      urlCount.total       || 0,
    total_clicks:    clickStats.total_clicks    || 0,
    unique_visitors: clickStats.unique_visitors || 0,
    clicks_last_7d:  recentClicks.clicks        || 0,
    top_urls: topUrls.map((u) => ({
      id:           u.id,
      slug:         u.slug,
      original_url: u.original_url,
      title:        u.title,
      click_count:  u.click_count,
    })),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fills in zero-click days so the time-series data is continuous.
 * Charts expect a data point for every day in the range — not just active days.
 */
function fillDateGaps(rows, days) {
  // Build a map of date → clicks from DB results
  const clickMap = new Map(rows.map((r) => [r.date, r.clicks]));

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    result.push({
      date: dateStr,
      clicks: clickMap.get(dateStr) || 0,
    });
  }

  return result;
}