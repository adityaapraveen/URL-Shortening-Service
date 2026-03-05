import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/connection.js';
import config from '../config/env.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';


// Helpers

function signToken(userId) {
  return jwt.sign(
    { sub: userId },  // 'sub' (subject) is the JWT standard claim for user ID
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}
// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @returns {{ user: object, token: string }}
 */
export async function register({ email, password, name }) {
  const normalizedEmail = email.toLowerCase().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new ValidationError('Please provide a valid email address.');
  }

  if (!password || password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters.');
  }

  if (!name || name.trim().length < 2) {
    throw new ValidationError('Name must be at least 2 characters.');
  }

  const existing = await db.getAsync(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (existing) {
    // SECURITY NOTE: This reveals whether the email is registered — acceptable
    // UX trade-off for a non-sensitive app. High-security apps (banking,
    // healthcare) would always return 200 to prevent user enumeration attacks.
    throw new ConflictError('An account with that email already exists.');
  }

  // Hash the password.
  // NEVER store plaintext passwords. bcrypt is correct because:
  //   1. Slow by design (BCRYPT_ROUNDS) — defeats brute force
  //   2. Auto-salts — identical passwords produce different hashes
  //   3. Purpose-built for passwords (unlike SHA/MD5)
  const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

  const result = await db.runAsync(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [normalizedEmail, hashedPassword, name.trim()]
  );

  // Fetch the full row — SQLite doesn't return it on INSERT
  const user = await db.getAsync('SELECT * FROM users WHERE rowid = ?', [result.lastID]);

  const token = signToken(user.id);

  return { user: sanitizeUser(user), token };
}

/**
 * Log in an existing user.
 * @returns {{ user: object, token: string }}
 */
export async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.getAsync(
    'SELECT * FROM users WHERE email = ?',
    [normalizedEmail]
  );

  // SECURITY NOTE: Same error message whether email doesn't exist OR password
  // is wrong — prevents user enumeration attacks.
  // We ALWAYS run bcrypt.compare using a dummy hash if user is null — prevents
  // timing attacks (a fast "not found" response reveals the email doesn't exist).
  const DUMMY_HASH = '$2a$12$dummyhashfortimingattackprevention000000000000000000000';
  const passwordToCheck = user ? user.password : DUMMY_HASH;

  const isPasswordValid = await bcrypt.compare(password, passwordToCheck);

  if (!user || !isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const token = signToken(user.id);

  return { user: sanitizeUser(user), token };
}

/**
 * Get the currently authenticated user by their ID.
 * @returns {object} user (without password)
 */
export async function getMe(userId) {
  const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);

  if (!user) {
    // Valid token but user was deleted — rare but must be handled.
    throw new NotFoundError('User not found.');
  }

  return sanitizeUser(user);
}