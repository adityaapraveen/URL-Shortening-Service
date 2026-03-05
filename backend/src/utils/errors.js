// src/utils/errors.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom error classes and error handling utilities.
//
// SENIOR DEV NOTE: Don't throw generic `new Error()` in your services.
// Use typed errors that carry HTTP status codes. This means your error handler
// middleware can respond correctly without every route needing try/catch logic.
//
// Pattern:
//   throw new AppError('User not found', 404)  ← in a service
//   → error handler middleware catches it       ← one place, clean JSON response
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base application error. All intentional errors should use this.
 * `isOperational: true` means "we expected this could happen" (vs a bug crash).
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    // Capture a clean stack trace that starts from where the error was thrown,
    // not from inside this constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to do this') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

// ─── Async Route Wrapper ──────────────────────────────────────────────────────
// Express doesn't catch async errors out of the box (prior to Express 5).
// Wrapping route handlers with this means you never need try/catch in routes —
// any thrown error automatically goes to the error handler middleware.
//
// Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};