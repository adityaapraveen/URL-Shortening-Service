
import { customAlphabet } from 'nanoid';
import db from '../db/connection.js';

// No ambiguous characters (0/O, 1/l)
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SLUG_LENGTH = 8;

const generate = customAlphabet(ALPHABET, SLUG_LENGTH);

/**
 * Generates a unique slug that doesn't exist in the database.
 * Retries up to 5 times on collision (practically will never need more than 1).
 */
export async function generateUniqueSlug() {
    const MAX_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const slug = generate();

        const existing = await db.getAsync(
            'SELECT id FROM urls WHERE slug = ?',
            [slug]
        );

        if (!existing) return slug;

        console.warn(`[Slug] Collision on attempt ${attempt}, retrying...`);
    }

    // If we hit this, something is deeply wrong (DB nearly full, or nanoid broken)
    throw new Error('Failed to generate a unique slug after maximum attempts.');
}

/**
 * Validates a user-provided custom slug.
 * Rules: 3–50 chars, alphanumeric + hyphens only, no leading/trailing hyphens.
 */
export function validateCustomSlug(slug) {
    if (!slug || typeof slug !== 'string') return false;
    if (slug.length < 3 || slug.length > 50) return false;

    // Alphanumeric and hyphens only, no leading/trailing hyphens
    const slugRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
    return slugRegex.test(slug);
}

// Reserved slugs that cannot be used — they'd conflict with API routes
export const RESERVED_SLUGS = new Set([
    'api', 'health', 'login', 'register', 'dashboard',
    'admin', 'static', 'assets', 'favicon.ico', 'robots.txt',
]);