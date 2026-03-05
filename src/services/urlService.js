import db from '../db/connection.js';
import config from '../config/env.js';
import { generateUniqueSlug, validateCustomSlug, RESERVED_SLUGS } from '../utils/slug.js';
import {
    ValidationError,
    ConflictError,
    NotFoundError,
    ForbiddenError,
} from '../utils/errors.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validates a URL string. Must be http or https — no javascript:, data:, etc.
 *
 * SENIOR DEV NOTE: Never redirect to an arbitrary URL without validating the
 * scheme. `javascript:alert(1)` is a valid URL string but would be an XSS
 * vector if a browser followed it. Always whitelist schemes explicitly.
 */

function validateUrl(url) {
    try {
        const parsed = new URL(url)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false
        }
        return true
    } catch {
        return false
    }
}

/**
 * Formats a URL row from the DB into a clean response object.
 * Adds the full short_url field so clients don't have to construct it.
 */

function formatUrl(row) {
    return {
        id: row.id,
        slug: row.slug,
        short_url: `${config.BASE_URL}/${row.slug}`,
        original_url: row.original_url,
        title: row.title,
        is_active: row.is_active === 1,
        expires_at: row.expires_at,
        click_count: row.click_count ?? 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}


// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Create a new shortened URL.
 *
 * @param {string} userId       - Authenticated user's ID
 * @param {string} originalUrl  - The URL to shorten
 * @param {object} options      - { customSlug?, title?, expiresAt? }
 */

export async function creatUrl(userId, { original_url, custom_slug, title, expires_at }) {
    if (!original_url) {
        throw new ValidationError('original_url is required')
    }

    if (!validateUrl(original_url)) {
        throw new ValidationError('Please provide a valid http or https URL')
    }
    let slug
    if (custom_slug) {
        const normalized = custom_slug.toLowerCase().trim()

        if (!validateCustomSlug(normalized)) {
            throw new ValidationError('Custom slig must be 3-50 characters, alphanumeric and hyphens only.')
        }
        if (RESERVED_SLUGS.has(normalized)) {
            throw new ValidationError(`"${normalized}" is a reserved slug and cannot be used.`)
        }

        const existing = await db.getAsync(`SELECT id FROM urls WHERE slug = ?`, [normalized])
        if (existing) {
            throw new ConflictError(`The slug "${normalized}" is already taken`)
        }
        slug = normalized
    } else {
        slug = await generateUniqueSlug()
    }

    //validate expiry
    let expiresAtTs = null
    if (expires_at) {
        const expiresDate = new Date(expires_at)
        if (isNaN(expiresDate.getTime()) || expiresDate <= new Date()) {
            throw new ValidationError('expires_at must be a valid future date.')
        }
        expiresAtTs = Math.floor(expiresDate.getTime() / 1000)
    }

    // Insert 
    const result = await db.runAsync(
        `INSERT INTO urls (user_id, original_url, slug, title, expires_at)
        VALUES (?, ?, ?, ?, ?)`,
        [userId, original_url, slug, title?.trim() || null, expiresAtTs]
    )

    const url = await db.getAsync(`SELECT * FROM urls WHERE rowid = ?`, [result.lastID])

    return formatUrl(url)
}

/**
 * Get all URLs belonging to the authenticated user.
 * Includes click counts via a JOIN — one query, not N+1.
 *
 * SENIOR DEV NOTE: N+1 query problem — fetching URLs then looping to fetch
 * click counts per URL is a classic mistake. One JOIN is always better.
 */

export async function getUserUrls(userId) {
    const rows = await db.allAsync(
        ` SELECT u.*, COUNT(c.id) AS click_count
        FROM urls U
        LEFT JOIN clicks c ON c.url_id = u.id
        WHERE u.user_id = ?
        GROUP BY u.id
        ORDER BY u.created_at DESC`,
        [userId]
    )
    return rows.map(formatUrl)
}
/**
 * Get a single URL by ID — only if it belongs to the requesting user.
 */
export async function getUrlById(urlId, userId) {
    const row = await db.getAsync(
        `SELECT 
        u.*,
       COUNT(c.id) AS click_count
     FROM urls u
     LEFT JOIN clicks c ON c.url_id = u.id
     WHERE u.id = ? AND u.user_id = ?
     GROUP BY u.id`,
        [urlId, userId]
    )
    if (!row) throw new NotFoundError('URL not found')

    return formatUrl(row)
}
/**
 * Update a URL's title or active status.
 * Only the owner can update their URL.
 */
export async function updateUrl(urlId, userId, { title, is_active }) {
    const existing = await db.getAsync(
        'SELECT * FROM urls WHERE id = ? AND user_id = ?',
        [urlId, userId]
    );

    if (!existing) throw new NotFoundError('URL not found.');

    const newTitle = title !== undefined ? title?.trim() || null : existing.title;
    const newIsActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active;

    await db.runAsync(
        `UPDATE urls
     SET title = ?, is_active = ?, updated_at = unixepoch()
     WHERE id = ?`,
        [newTitle, newIsActive, urlId]
    );

    return getUrlById(urlId, userId);
}


/**
 * Delete a URL. Only the owner can delete it.
 * Cascade delete in the DB handles removing associated clicks.
 */
export async function deleteUrl(urlId, userId) {
    const existing = await db.getAsync(
        'SELECT id FROM urls WHERE id = ? AND user_id = ?',
        [urlId, userId]
    );

    if (!existing) throw new NotFoundError('URL not found.');

    await db.runAsync('DELETE FROM urls WHERE id = ?', [urlId]);
}


/**
 * Resolve a slug to its destination URL.
 * Called by the redirect endpoint — must be fast.
 *
 * Returns the full URL row so the redirect handler can also log the click.
 */
export async function resolveSlug(slug) {
  const url = await db.getAsync(
    'SELECT * FROM urls WHERE slug = ? AND is_active = 1',
    [slug]
  );

  if (!url) throw new NotFoundError('Short URL not found or has been deactivated.');

  // Check expiry
  if (url.expires_at && url.expires_at < Math.floor(Date.now() / 1000)) {
    throw new NotFoundError('This short URL has expired.');
  }

  return url;
}
