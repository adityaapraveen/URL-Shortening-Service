
import config from '../config/env.js';
import { AppError } from '../utils/errors.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error({
        type: 'error',
        message: err.message,
        statusCode: err.statusCode || 500,
        path: req.path,
        method: req.method,
        ...(config.NODE_ENV !== 'production' && { stack: err.stack }),
    });

    // ── Operational errors: safe to expose message to client ──
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }

    // ── SQLite constraint violations ──
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
            success: false,
            error: 'A record with that value already exists.',
        });
    }

    // ── JWT errors from jsonwebtoken library ──
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token.',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token has expired. Please log in again.',
        });
    }

    // ── Unhandled / programming errors ──
    // In development: show the real error. In production: hide it.
    const isDev = config.NODE_ENV === 'development';

    return res.status(500).json({
        success: false,
        error: isDev ? err.message : 'Internal server error.',
        ...(isDev && { stack: err.stack }),
    });
};

export default errorHandler;
