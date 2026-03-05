import sqlite3pkg from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

// ES Modules don't have __dirname. This is the standard replacement pattern.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite3 = sqlite3pkg.verbose();

// Ensure the directory for the DB file exists.
const dbDir = path.dirname(path.resolve(config.DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(config.DB_PATH);

// Create the connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Failed to connect to SQLite database:', err.message);
    process.exit(1);
  }
  console.log(`[DB] Connected to SQLite at ${dbPath}`);
});

// ─── Critical SQLite Performance & Safety Settings ───────────────────────────

db.serialize(() => {
  // WAL mode: the single most impactful SQLite performance setting.
  db.run('PRAGMA journal_mode = WAL;');

  // Foreign key enforcement is OFF by default in SQLite. That's insane.
  db.run('PRAGMA foreign_keys = ON;');

  // Synchronous=NORMAL is safe with WAL and much faster than FULL.
  db.run('PRAGMA synchronous = NORMAL;');

  // SQLite caches pages in memory. 64MB is reasonable for a small app.
  db.run('PRAGMA cache_size = -64000;');

  // Store temp tables in memory instead of on disk.
  db.run('PRAGMA temp_store = MEMORY;');
});

// ─── Promisified Helpers ──────────────────────────────────────────────────────
// sqlite3 is callback-based. We wrap the three main methods in Promises so we
// can use async/await throughout the rest of the app.
//
// db.run   → for INSERT, UPDATE, DELETE (returns { lastID, changes })
// db.get   → for SELECT that returns one row
// db.all   → for SELECT that returns multiple rows

db.runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

db.getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

db.allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

export default db;