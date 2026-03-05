
import db from './connection.js';

// ─── Migration Definitions ────────────────────────────────────────────────────
// Add new migrations by appending to this array. NEVER edit existing migrations
// that have already run in production — always add a new one.

const migrations = [
    {
        id: 1,
        name: 'create_users_table',
        up: `
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email       TEXT NOT NULL UNIQUE,
        password    TEXT NOT NULL,
        name        TEXT NOT NULL,
        created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `,
    },
    {
        id: 2,
        name: 'create_urls_table',
        up: `
      CREATE TABLE IF NOT EXISTS urls (
        id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_url TEXT NOT NULL,
        slug         TEXT NOT NULL UNIQUE,
        title        TEXT,
        is_active    INTEGER NOT NULL DEFAULT 1,
        expires_at   INTEGER,
        created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX IF NOT EXISTS idx_urls_slug    ON urls(slug);
      CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
    `,
    },
    {
        id: 3,
        name: 'create_clicks_table',
        up: `
      CREATE TABLE IF NOT EXISTS clicks (
        id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        url_id      TEXT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
        clicked_at  INTEGER NOT NULL DEFAULT (unixepoch()),
        ip_address  TEXT,
        user_agent  TEXT,
        referer     TEXT,
        country     TEXT,
        device_type TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_clicks_url_id     ON clicks(url_id);
      CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
    `,
    },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

export async function migrate() {
    console.log('[Migrate] Starting database migrations...');

    await db.runAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INTEGER PRIMARY KEY,
      name       TEXT NOT NULL,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

    const applied = await db.allAsync('SELECT id FROM schema_migrations');
    const appliedIds = new Set(applied.map((r) => r.id));

    let ranCount = 0;

    for (const migration of migrations) {
        if (appliedIds.has(migration.id)) {
            console.log(`[Migrate] Skipping #${migration.id} "${migration.name}" (already applied)`);
            continue;
        }

        try {
            await new Promise((resolve, reject) => {
                db.exec(migration.up, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await db.runAsync(
                'INSERT INTO schema_migrations (id, name) VALUES (?, ?)',
                [migration.id, migration.name]
            );

            console.log(`[Migrate] ✓ Applied #${migration.id} "${migration.name}"`);
            ranCount++;
        } catch (err) {
            console.error(`[Migrate] ✗ Failed on #${migration.id} "${migration.name}":`, err.message);
            process.exit(1);
        }
    }

    if (ranCount === 0) {
        console.log('[Migrate] Database is up to date. Nothing to run.');
    } else {
        console.log(`[Migrate] Done. Applied ${ranCount} migration(s).`);
    }
}

// ─── Run directly: `node src/db/migrate.js` ──────────────────────────────────
// ES Module equivalent of `if (require.main === module)`
import { fileURLToPath } from 'url';
import path from 'path';

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
    migrate()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('[Migrate] Unexpected error:', err);
            process.exit(1);
        });
}