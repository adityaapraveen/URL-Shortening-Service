
import 'dotenv/config';

function requireEnv(key, defaultValue) {
    const value = process.env[key] ?? defaultValue;

    if (value === undefined || value === '') {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
}

const config = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),

    // Public-facing base URL — used to build short links.
    BASE_URL: requireEnv('BASE_URL', 'http://localhost:3000'),

    // Frontend URL — used for CORS in production
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Auth — MUST be a long random secret in production
    JWT_SECRET: requireEnv('JWT_SECRET', 'CHANGE_THIS_IN_PRODUCTION'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Database — SQLite file path. On Render, use a persistent disk mount path.
    DB_PATH: process.env.DB_PATH || './data/db.sqlite',

    // Bcrypt rounds. 12 is the production standard.
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

if (config.NODE_ENV === 'production' && config.JWT_SECRET === 'CHANGE_THIS_IN_PRODUCTION') {
    throw new Error('You MUST set a real JWT_SECRET in production. Refusing to start.');
}

export default config;
