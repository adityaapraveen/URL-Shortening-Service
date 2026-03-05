# Sniplink — Modern URL Shortening Service

A **production-grade** URL shortening service built like a senior developer would build it. Full-stack application with a **Node.js/Express** backend, **SQLite** database, and a **React (Vite)** frontend — designed for deployment on **Render**.

> Built to learn real-world backend architecture, security best practices, and modern frontend design patterns.

![Landing Page](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react)
![Backend](https://img.shields.io/badge/Backend-Express.js-000000?style=for-the-badge&logo=express)
![Database](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)
![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render)

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [What I Learned](#-what-i-learned)
  - [1. Express Application Architecture](#1-express-application-architecture)
  - [2. Custom Error Handling Pattern](#2-custom-error-handling-pattern)
  - [3. JWT Authentication Flow](#3-jwt-authentication-flow)
  - [4. Password Security with bcrypt](#4-password-security-with-bcrypt)
  - [5. SQLite Performance Tuning](#5-sqlite-performance-tuning)
  - [6. Database Migration System](#6-database-migration-system)
  - [7. Rate Limiting Strategy](#7-rate-limiting-strategy)
  - [8. 301 vs 302 Redirects](#8-301-vs-302-redirects)
  - [9. Fire-and-Forget Pattern](#9-fire-and-forget-pattern)
  - [10. Slug Generation & Collision Handling](#10-slug-generation--collision-handling)
  - [11. Security Best Practices](#11-security-best-practices)
  - [12. N+1 Query Problem](#12-n1-query-problem)
  - [13. React Frontend Architecture](#13-react-frontend-architecture)
  - [14. Centralized API Client](#14-centralized-api-client)
  - [15. Auth Context & Protected Routes](#15-auth-context--protected-routes)
  - [16. CSS Design System](#16-css-design-system)
  - [17. Infrastructure as Code](#17-infrastructure-as-code)
- [Deployment on Render](#-deployment-on-render)
- [License](#-license)

---

## Features

| Feature | Description |
|---|---|
| **URL Shortening** | Shorten any URL with auto-generated or custom slugs |
| **Click Analytics** | Total clicks, unique visitors, device breakdown, referrer tracking |
| **Time-Series Data** | Visualize clicks over time (7/30/90 day windows) |
| **Custom Slugs** | Create branded, memorable short links |
| **Link Expiration** | Set auto-expiry dates for temporary campaigns |
| **JWT Authentication** | Secure user registration, login, and session management |
| **Rate Limiting** | Brute-force protection on auth, general API throttling |
| **Modern UI** | Dark-themed SaaS landing page, auth pages, and full dashboard |
| **Responsive Design** | Works on mobile, tablet, and desktop |
| **Production-Ready** | Helmet.js, CORS, error handling, logging, health checks |

---

## Tech Stack

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** SQLite3 (with WAL mode)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Morgan
- **Process:** Nodemon (dev), Node (prod)

### Frontend
- **Build Tool:** Vite
- **UI Library:** React 19
- **Routing:** React Router DOM v7
- **Styling:** Vanilla CSS with CSS Custom Properties
- **Font:** Inter (Google Fonts)

### Deployment
- **Platform:** Render
- **Config:** Infrastructure-as-Code (`render.yaml`)
- **Database:** Persistent disk for SQLite (Render Starter plan)

---

## Project Structure

```
URLShorteningService/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Entry point — Express setup, middleware, routes
│   │   ├── config/
│   │   │   └── env.js                # Environment variable loader with validation
│   │   ├── db/
│   │   │   ├── connection.js         # SQLite connection + PRAGMA tuning
│   │   │   └── migrate.js            # Migration runner (append-only migrations)
│   │   ├── middlewares/
│   │   │   ├── authenticate.js       # JWT verification middleware
│   │   │   ├── errorHandler.js       # Global error handler (operational vs crash)
│   │   │   └── rateLimiter.js        # Auth + API rate limiters
│   │   ├── routes/
│   │   │   ├── auth.js               # POST /register, /login, GET /me
│   │   │   ├── urls.js               # CRUD for shortened URLs
│   │   │   ├── analytics.js          # Dashboard stats, per-URL analytics
│   │   │   └── redirect.js           # GET /:slug — the core redirect logic
│   │   ├── services/
│   │   │   ├── authService.js        # Registration, login, token generation
│   │   │   ├── urlService.js         # URL CRUD, slug resolution
│   │   │   ├── clickService.js       # Fire-and-forget click recording
│   │   │   └── analyticsService.js   # SQL aggregation queries
│   │   └── utils/
│   │       ├── errors.js             # Custom error classes (AppError hierarchy)
│   │       └── slug.js               # nanoid-based slug generation
│   ├── render.yaml                   # Render deployment config (IaC)
│   ├── package.json
│   └── .env                          # Local environment variables
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Router + conditional layout
│   │   ├── index.css                 # Design system (CSS custom properties)
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── services/
│   │   │   └── api.js                # Centralized HTTP client
│   │   ├── components/
│   │   │   ├── Navbar/               # Auth-aware navigation + mobile menu
│   │   │   ├── Footer/               # Site footer
│   │   │   ├── Sidebar/              # Dashboard sidebar
│   │   │   └── ProtectedRoute/       # Auth guard component
│   │   └── pages/
│   │       ├── Landing/              # Hero, features, pricing, CTA
│   │       ├── Login/                # Login form
│   │       ├── Signup/               # Registration form
│   │       └── Dashboard/            # Stats, URL CRUD, analytics
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md                         # ← You are here
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+ (LTS recommended)
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/adityaapraveen/URL-Shortening-Service.git
cd URL-Shortening-Service
```

### 2. Start the Backend

```bash
cd backend
npm install

# Create your .env file
cp .env.example .env   # or create manually (see Environment Variables section)

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

The backend runs on `http://localhost:3000` by default.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `localhost:3000`.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./data/db.sqlite
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

For the frontend, create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

> **Never commit `.env` files.** The `JWT_SECRET` must be a long, random string in production. Render can auto-generate this for you.

---

## API Reference

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | `{ email, password, name }` | Create account |
| `POST` | `/api/auth/login` | `{ email, password }` | Get JWT token |
| `GET` | `/api/auth/me` | — | Get current user (requires `Bearer` token) |

### URLs

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/urls` | `{ original_url, custom_slug?, title?, expires_at? }` | Create short URL |
| `GET` | `/api/urls` | — | List all user's URLs |
| `GET` | `/api/urls/:id` | — | Get single URL |
| `PATCH` | `/api/urls/:id` | `{ title?, is_active? }` | Update URL |
| `DELETE` | `/api/urls/:id` | — | Delete URL + clicks |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/dashboard` | Aggregate stats (total clicks, unique visitors, top URLs) |
| `GET` | `/api/analytics/:urlId` | Per-URL stats (devices, referrers) |
| `GET` | `/api/analytics/:urlId/timeseries?days=30` | Click data over time |

### Redirect

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:slug` | Resolves slug → 302 redirect to original URL |

---

## What I Learned

### 1. Express Application Architecture

The app follows a **layered architecture** — routes → services → database. Routes handle HTTP, services handle business logic, and the database layer is isolated.

```javascript
// src/app.js — Middleware order matters!
app.use(helmet());                              // Security headers FIRST
app.use(cors({ origin: ... }));                 // CORS before routes
app.use(express.json({ limit: '10kb' }));       // Parse JSON (with size limit!)
app.use(morgan('dev'));                          // Logging

app.use('/api/auth', authLimiter, authRouter);   // Strict rate limit on auth
app.use('/api/urls', apiLimiter, urlRouter);      // General rate limit
app.use('/', redirectRouter);                    // Catch-all LAST

app.use(errorHandler);                           // Error handler at the very end
```

**Key takeaway:** Middleware execution order in Express is **first-registered, first-run**. Security middleware goes first, catch-all routes go last, error handlers go at the very end.

---

### 2. Custom Error Handling Pattern

Instead of scattering `try/catch` and `res.status().json()` in every route, use **typed error classes** with HTTP status codes:

```javascript
// utils/errors.js — Error hierarchy
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational; // Expected error vs. bug crash
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Invalid input') {
        super(message, 400);
    }
}
```

Then in services, just **throw** — the global error handler catches everything:

```javascript
// In a service:
if (!url) throw new NotFoundError('URL not found');

// The error handler middleware (one place) converts this to:
// { success: false, error: "URL not found" } with status 404
```

**Key takeaway:** One error handler middleware, typed errors everywhere. No `try/catch` clutter in routes.

---

### 3. JWT Authentication Flow

JWT (JSON Web Token) provides **stateless authentication** — the server doesn't store sessions.

```javascript
// 1. User logs in → server creates a signed token
function signToken(userId) {
    return jwt.sign(
        { sub: userId },          // 'sub' is the standard JWT claim for "subject"
        config.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// 2. Client stores token in localStorage, sends with every request:
//    Authorization: Bearer eyJhbGciOi...

// 3. Middleware verifies on every protected route
const decoded = jwt.verify(token, config.JWT_SECRET);
const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [decoded.sub]);
req.user = user;  // Attach to request for downstream use
```

**Key takeaway:** JWTs eliminate server-side session storage. The token itself contains the user identity, signed with a secret only the server knows.

---

### 4. Password Security with bcrypt

Never store plaintext passwords. bcrypt is the correct choice because it's **slow by design**:

```javascript
// Registration — hash the password
const hashedPassword = await bcrypt.hash(password, 12);
// 12 rounds = ~250ms per hash. An attacker trying 1 million passwords
// would need ~70 hours. SHA256 would take ~1 second.

// Login — compare securely
const isValid = await bcrypt.compare(password, user.password);
```

**Timing attack prevention** — even when the user doesn't exist:

```javascript
// BAD: if (!user) return "Not found"  ← fast response reveals email doesn't exist
// GOOD: Always run bcrypt.compare, even with a dummy hash
const DUMMY_HASH = '$2a$12$dummyhash...';
const passwordToCheck = user ? user.password : DUMMY_HASH;
const isValid = await bcrypt.compare(password, passwordToCheck);
```

**Key takeaway:** bcrypt auto-salts (identical passwords produce different hashes), and its slowness is a feature, not a bug.

---

### 5. SQLite Performance Tuning

SQLite is fast out of the box, but **PRAGMAs** make it production-worthy:

```javascript
// connection.js — Run these on every connection
db.run('PRAGMA journal_mode = WAL;');     // Write-Ahead Logging: 10x faster writes
db.run('PRAGMA foreign_keys = ON;');       // FK enforcement is OFF by default (!!)
db.run('PRAGMA synchronous = NORMAL;');    // Safe with WAL, much faster than FULL
db.run('PRAGMA cache_size = -64000;');     // 64MB in-memory cache
db.run('PRAGMA temp_store = MEMORY;');     // Temp tables in RAM, not disk
```

**Key takeaway:** `PRAGMA journal_mode = WAL` is the single most impactful SQLite performance setting. Without it, writes lock the entire database.

---

### 6. Database Migration System

Migrations are **append-only versioned SQL scripts**. Never edit a migration that's already run in production — always add a new one:

```javascript
const migrations = [
    {
        id: 1,
        name: 'create_users_table',
        up: `CREATE TABLE IF NOT EXISTS users (
            id       TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            email    TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name     TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
    },
    // Migration #2, #3, etc. are always APPENDED, never modified
];
```

The runner tracks what's been applied:

```javascript
const applied = await db.allAsync('SELECT id FROM schema_migrations');
// Skip already-applied migrations, run new ones
```

**Key takeaway:** Migrations ensure every environment (dev, staging, prod) has the exact same schema. `npm run migrate && npm start` on every deploy guarantees consistency.

---

### 7. Rate Limiting Strategy

Two different rate limiters for different threat models:

```javascript
// Auth: STRICT — 5 attempts per 15 minutes
// Prevents password brute-force attacks
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

// API: GENERAL — 100 requests per 15 minutes
// Prevents scraping and automated abuse
export const apiLimiter = rateLimit({
    windowMs: 900000,
    max: 100,
});
```

**Behind a proxy (Render):**
```javascript
// Without this, every user appears as the SAME IP (the proxy's IP)
if (config.NODE_ENV === 'production') {
    app.set('trust proxy', 1);  // Trust exactly 1 proxy hop
}
```

**Key takeaway:** Rate limiting is non-negotiable for auth endpoints. A legitimate user won't login 6 times in 15 minutes — an attacker will.

---

### 8. 301 vs 302 Redirects

The most consequential decision in a URL shortener:

| | **301 Permanent** | **302 Temporary** |
|---|---|---|
| **Caching** | Browser caches **forever** | Never cached |
| **Analytics** | ❌ Breaks after first visit | ✅ Every click hits server |
| **Link Updates** | ❌ Can't change destination | ✅ Changes take effect immediately |
| **Performance** | Faster (browser skips server) | One extra HTTP round trip |

```javascript
// Always use 302 for URL shorteners
res.redirect(302, url.original_url);
```

**Key takeaway:** 301 seems "correct" but it breaks analytics and makes links unmanageable. The tiny performance cost of 302 is worth it.

---

### 9. Fire-and-Forget Pattern

The redirect is on the **hot path** — users shouldn't wait for analytics to be written:

```javascript
// redirect.js — Send response FIRST, record click AFTER
router.get('/:slug', asyncHandler(async (req, res) => {
    const url = await resolveSlug(slug);

    res.redirect(302, url.original_url);  // User is already redirecting

    recordClick(url.id, req);  // NOT awaited — runs in background
}));
```

The click service swallows its own errors:

```javascript
export async function recordClick(urlId, req) {
    try {
        await db.runAsync('INSERT INTO clicks ...', [...]);
    } catch (err) {
        // NEVER let click recording crash the app
        console.error('[ClickService] Failed:', err.message);
    }
}
```

**Key takeaway:** Trade-off: you might lose a click if the server crashes between redirect and DB write. For analytics, 99.99% accuracy is fine. For billing, it wouldn't be.

---

### 10. Slug Generation & Collision Handling

Using `nanoid` with a custom alphabet (no ambiguous characters like `0/O`, `1/l`):

```javascript
import { customAlphabet } from 'nanoid';

const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generate = customAlphabet(ALPHABET, 8);  // 8-char slugs

// Retry on collision (practically never happens)
export async function generateUniqueSlug() {
    for (let attempt = 1; attempt <= 5; attempt++) {
        const slug = generate();
        const existing = await db.getAsync('SELECT id FROM urls WHERE slug = ?', [slug]);
        if (!existing) return slug;
        console.warn(`Collision on attempt ${attempt}, retrying...`);
    }
    throw new Error('Failed to generate unique slug');
}
```

**Reserved slugs** prevent conflicts with system routes:

```javascript
export const RESERVED_SLUGS = new Set([
    'api', 'health', 'login', 'register', 'dashboard',
    'admin', 'static', 'assets', 'favicon.ico',
]);
```

**Key takeaway:** With 54 characters × 8 length = ~54^8 = 72 trillion combinations. Collisions are astronomically rare, but handling them is professional.

---

### 11. Security Best Practices

A checklist of security measures implemented:

| Practice | Implementation |
|---|---|
| **HTTPS-only URLs** | `validateUrl()` rejects `javascript:`, `data:` schemes |
| **Helmet.js** | Sets security headers (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS** | Restricted to `BASE_URL` in production, `*` in development |
| **Request size limit** | `express.json({ limit: '10kb' })` prevents payload bombs |
| **JWT Secret validation** | Server refuses to start if `JWT_SECRET` is the default value in production |
| **User enumeration prevention** | Login returns the same error for wrong email AND wrong password |
| **Timing attack prevention** | Always runs bcrypt.compare, even when user doesn't exist |
| **Input validation** | Email regex, password length, slug format, URL scheme checks |
| **SQL injection prevention** | Parameterized queries everywhere (`?` placeholders) |
| **Foreign key cascade** | Deleting a URL auto-deletes all associated click records |

---

### 12. N+1 Query Problem

A classic database performance anti-pattern — avoided by using JOINs:

```javascript
// ❌ BAD — N+1 queries (1 query for URLs + N queries for click counts)
const urls = await db.allAsync('SELECT * FROM urls WHERE user_id = ?');
for (const url of urls) {
    url.clicks = await db.getAsync('SELECT COUNT(*) FROM clicks WHERE url_id = ?', [url.id]);
}

// ✅ GOOD — Single JOIN query
const urls = await db.allAsync(`
    SELECT u.*, COUNT(c.id) AS click_count
    FROM urls u
    LEFT JOIN clicks c ON c.url_id = u.id
    WHERE u.user_id = ?
    GROUP BY u.id
    ORDER BY u.created_at DESC
`, [userId]);
```

**Key takeaway:** If you have 100 URLs, the bad approach makes 101 database calls. The JOIN makes 1. Always think about query count.

---

### 13. React Frontend Architecture

The frontend follows a **component-based architecture** with separation of concerns:

```
pages/      → Full page components (Landing, Login, Signup, Dashboard)
components/ → Reusable UI pieces (Navbar, Footer, Sidebar, ProtectedRoute)
context/    → Global state (AuthContext)
services/   → API communication layer (api.js)
```

**Conditional layout rendering** — different pages get different chrome:

```jsx
// App.jsx — Smart layout logic
function AppLayout() {
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/dashboard');
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);

    return (
        <>
            {!isAuthPage && <Navbar />}          {/* No navbar on login/signup */}
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard/*" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
            </Routes>
            {!isDashboard && !isAuthPage && <Footer />}  {/* Footer only on public pages */}
        </>
    );
}
```

---

### 14. Centralized API Client

All HTTP calls go through a single `request()` function that handles auth headers and errors:

```javascript
// services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),  // Auto-inject JWT
        },
        ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 204) return { success: true };  // Handle DELETE responses

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong');
    return data;
}

// Clean API surface:
export const urlAPI = {
    create: (body) => request('/api/urls', { method: 'POST', body: JSON.stringify(body) }),
    getAll: () => request('/api/urls'),
    delete: (id) => request(`/api/urls/${id}`, { method: 'DELETE' }),
};
```

**Key takeaway:** Every API call automatically gets the JWT token. Error handling is centralized. No duplicate `fetch` logic across components.

---

### 15. Auth Context & Protected Routes

React Context provides **global auth state** without prop drilling:

```jsx
// context/AuthContext.jsx
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: try to restore session from stored token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authAPI.getMe()
                .then((res) => setUser(res.data.user))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    // ... register, logout
}
```

**Protected routes** redirect unauthenticated users:

```jsx
// components/ProtectedRoute/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
```

---

### 16. CSS Design System

Instead of a CSS framework, the project uses a **custom design system** with CSS custom properties:

```css
/* index.css — Design tokens */
:root {
    /* Colors */
    --bg-primary: #0a0a0f;
    --accent-primary: #6366f1;
    --accent-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);

    /* Typography */
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-2xl: 1.5rem;

    /* Spacing (consistent scale) */
    --space-1: 0.25rem;   /* 4px */
    --space-4: 1rem;      /* 16px */
    --space-8: 2rem;      /* 32px */

    /* Shadows with accent glow */
    --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
}
```

**Benefits over inline styles or utility-first CSS:**
- Change `--accent-primary` once → entire app updates
- Consistent spacing across all components
- Easy to create dark/light theme variants
- External CSS files are cacheable by the browser

---

### 17. Infrastructure as Code

The `render.yaml` file defines **everything** about the deployment:

```yaml
services:
  - type: web
    name: url-shortener
    runtime: node
    buildCommand: npm install --omit=dev    # No devDependencies in production
    startCommand: npm run migrate && npm start  # Migrate on every deploy
    healthCheckPath: /health                    # Deploy only succeeds if this returns 200

    envVars:
      - key: JWT_SECRET
        generateValue: true    # Render auto-generates a crypto-random secret
      - key: DB_PATH
        value: /var/data/db.sqlite  # Points to persistent disk
```

---

## Deployment on Render

### Backend (Web Service)

1. Push your code to GitHub
2. Create a new **Web Service** on Render
3. Connect your repository, point to `backend/` directory
4. Set **Build Command:** `npm install --omit=dev`
5. Set **Start Command:** `npm run migrate && npm start`
6. Add environment variables (see above)
7. Enable persistent disk at `/var/data` (requires Starter plan)

### Frontend (Static Site)

1. Create a new **Static Site** on Render
2. Point to `frontend/` directory
3. Set **Build Command:** `npm install && npm run build`
4. Set **Publish Directory:** `dist`
5. Add **Rewrite Rule:** `/* → /index.html` (critical for React Router)
6. Set `VITE_API_URL` environment variable to your backend URL

> **Important:** The `/* → /index.html` rewrite rule is critical. Without it, refreshing on `/dashboard` returns a 404 because Render looks for a `dashboard/index.html` file that doesn't exist.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

**Built by [Aditya Praveen](https://github.com/adityaapraveen)** 
