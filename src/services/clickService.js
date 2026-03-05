// Click tracking logic.
//
// SENIOR DEV NOTE: Click tracking is on the critical path of every redirect.
// The redirect should feel instant — we don't want to make the user wait for
// analytics to be written to the DB before they get redirected.
//
// The pattern used here: redirect FIRST, then record the click asynchronously.
// The route handler sends the 302 response, THEN fires recordClick() without
// awaiting it. The user is already navigating to the destination while we
// write to the DB in the background.
//
// This is a deliberate trade-off: we might lose a click record if the server
// crashes between the redirect and the write. For analytics, this is fine —
// 99.99% accuracy is acceptable. For billing, it would not be.

import db from '../db/connection.js';

/**
 * Parses the User-Agent string into a simple device category.
 * We're not using a library here — a simple heuristic is sufficient for
 * device-type analytics without the overhead of a full UA parsing library.
 */
function parseDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
}

/**
 * Extracts the real client IP address from the request.
 *
 * SENIOR DEV NOTE: On Render (and behind any proxy/CDN), the real IP is in
 * the X-Forwarded-For header, not req.ip. The header can contain a comma-
 * separated chain of IPs (client, proxy1, proxy2...) — the first one is
 * the actual client.
 *
 * We only store IPs for analytics — consider your privacy policy and GDPR
 * obligations before storing raw IPs in production.
 */
function extractIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
}


/**
 * Records a click event for a given URL.
 * Designed to be called without awaiting — fire-and-forget after redirect.
 *
 * @param {string} urlId  - The URL's ID
 * @param {object} req    - Express request object (for metadata extraction)
 */
export async function recordClick(urlId, req) {
  try {
    const ip        = extractIp(req);
    const userAgent = req.headers['user-agent'] || null;
    const referer   = req.headers['referer'] || req.headers['referrer'] || null;
    const device    = parseDeviceType(userAgent);

    await db.runAsync(
      `INSERT INTO clicks (url_id, ip_address, user_agent, referer, device_type)
       VALUES (?, ?, ?, ?, ?)`,
      [urlId, ip, userAgent, referer, device]
    );
  } catch (err) {
    // NEVER let click recording failure propagate — the redirect already happened.
    // Log it for observability, but swallow the error.
    console.error('[ClickService] Failed to record click:', err.message);
  }
}
