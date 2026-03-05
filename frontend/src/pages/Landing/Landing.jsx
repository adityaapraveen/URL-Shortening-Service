import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
    return (
        <div className="landing" id="landing-page">
            {/* ─── Hero Section ──────────────────────────────────────────────────── */}
            <section className="hero" id="hero-section">
                <div className="hero__bg-grid"></div>
                <div className="hero__glow hero__glow--1"></div>
                <div className="hero__glow hero__glow--2"></div>

                <div className="hero__inner container">
                    <div className="hero__badge" id="hero-badge">
                        <span className="hero__badge-dot"></span>
                        Open Source URL Shortener
                    </div>
                    <h1 className="hero__title" id="hero-title">
                        Shorten Links.<br />
                        <span className="hero__title-gradient">Track Everything.</span>
                    </h1>
                    <p className="hero__subtitle" id="hero-subtitle">
                        Sniplink is a modern, developer-first URL shortener with built-in analytics.
                        Custom slugs, expiration dates, device tracking, and referrer insights — all in one place.
                    </p>
                    <div className="hero__actions">
                        <Link to="/signup" className="hero__btn hero__btn--primary" id="hero-cta-signup">
                            Start Shortening — Free
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <a href="https://github.com/adityaapraveen/URL-Shortening-Service" target="_blank" rel="noopener noreferrer" className="hero__btn hero__btn--outline" id="hero-cta-github">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            View on GitHub
                        </a>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="hero__preview" id="hero-preview">
                        <div className="hero__preview-window">
                            <div className="hero__preview-bar">
                                <div className="hero__preview-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <div className="hero__preview-url">sniplink.app/dashboard</div>
                            </div>
                            <div className="hero__preview-content">
                                <div className="hero__preview-sidebar">
                                    <div className="hero__preview-nav-item hero__preview-nav-item--active"></div>
                                    <div className="hero__preview-nav-item"></div>
                                    <div className="hero__preview-nav-item"></div>
                                </div>
                                <div className="hero__preview-main">
                                    <div className="hero__preview-stat-row">
                                        <div className="hero__preview-stat">
                                            <div className="hero__preview-stat-value">12.4K</div>
                                            <div className="hero__preview-stat-label">Total Clicks</div>
                                        </div>
                                        <div className="hero__preview-stat">
                                            <div className="hero__preview-stat-value">847</div>
                                            <div className="hero__preview-stat-label">Unique Visitors</div>
                                        </div>
                                        <div className="hero__preview-stat">
                                            <div className="hero__preview-stat-value">23</div>
                                            <div className="hero__preview-stat-label">Active Links</div>
                                        </div>
                                    </div>
                                    <div className="hero__preview-chart">
                                        <div className="hero__preview-bar-chart">
                                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                                <div key={i} className="hero__preview-bar-item" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Logos / Social Proof ───────────────────────────────────────────── */}
            <section className="social-proof" id="social-proof">
                <div className="container">
                    <p className="social-proof__text">Trusted by developers & teams worldwide</p>
                    <div className="social-proof__logos">
                        <span className="social-proof__logo">🚀 Startups</span>
                        <span className="social-proof__logo">🏢 Enterprises</span>
                        <span className="social-proof__logo">👨‍💻 Developers</span>
                        <span className="social-proof__logo">📱 Creators</span>
                        <span className="social-proof__logo">📊 Marketers</span>
                    </div>
                </div>
            </section>

            {/* ─── Features Section ──────────────────────────────────────────────── */}
            <section className="features" id="features">
                <div className="features__inner container">
                    <div className="features__header">
                        <span className="features__eyebrow">Features</span>
                        <h2 className="features__title">Everything you need to manage your links</h2>
                        <p className="features__subtitle">
                            Built with a senior developer's mindset — secure, performant, and production-ready.
                        </p>
                    </div>

                    <div className="features__grid">
                        <div className="features__card" id="feature-shorten">
                            <div className="features__card-icon">🔗</div>
                            <h3 className="features__card-title">Instant URL Shortening</h3>
                            <p className="features__card-desc">
                                Shorten any URL in milliseconds. Auto-generated slugs or custom aliases
                                — your choice. Every link is production-ready.
                            </p>
                        </div>

                        <div className="features__card" id="feature-analytics">
                            <div className="features__card-icon">📊</div>
                            <h3 className="features__card-title">Powerful Analytics</h3>
                            <p className="features__card-desc">
                                Track total clicks, unique visitors, device breakdowns, top referrers,
                                and time-series data. Real insights, not vanity metrics.
                            </p>
                        </div>

                        <div className="features__card" id="feature-custom-slugs">
                            <div className="features__card-icon">✨</div>
                            <h3 className="features__card-title">Custom Slugs</h3>
                            <p className="features__card-desc">
                                Create branded, memorable links with custom slugs.
                                Reserved slug protection prevents conflicts with system routes.
                            </p>
                        </div>

                        <div className="features__card" id="feature-expiry">
                            <div className="features__card-icon">⏱️</div>
                            <h3 className="features__card-title">Link Expiration</h3>
                            <p className="features__card-desc">
                                Set expiration dates for temporary campaigns. Links automatically
                                deactivate when they expire — no cleanup needed.
                            </p>
                        </div>

                        <div className="features__card" id="feature-security">
                            <div className="features__card-icon">🔒</div>
                            <h3 className="features__card-title">Enterprise-Grade Security</h3>
                            <p className="features__card-desc">
                                JWT authentication, bcrypt password hashing, rate limiting,
                                Helmet.js headers, and URL scheme validation. No shortcuts.
                            </p>
                        </div>

                        <div className="features__card" id="feature-api">
                            <div className="features__card-icon">⚡</div>
                            <h3 className="features__card-title">RESTful API</h3>
                            <p className="features__card-desc">
                                Clean, well-documented REST API. Perfect for integrations,
                                automations, and building custom workflows on top.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── How It Works ──────────────────────────────────────────────────── */}
            <section className="how-it-works" id="how-it-works">
                <div className="container">
                    <div className="features__header">
                        <span className="features__eyebrow">How It Works</span>
                        <h2 className="features__title">Three steps to shorter, smarter links</h2>
                    </div>

                    <div className="steps">
                        <div className="steps__item" id="step-1">
                            <div className="steps__number">01</div>
                            <h3 className="steps__title">Paste Your URL</h3>
                            <p className="steps__desc">
                                Drop in any long URL. Optionally set a custom slug, title, or expiration date.
                            </p>
                        </div>
                        <div className="steps__divider">
                            <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--border-secondary)" strokeWidth="2" strokeDasharray="4 4" /></svg>
                        </div>
                        <div className="steps__item" id="step-2">
                            <div className="steps__number">02</div>
                            <h3 className="steps__title">Share Everywhere</h3>
                            <p className="steps__desc">
                                Get your shortened link instantly. Share it on social media, emails, or anywhere.
                            </p>
                        </div>
                        <div className="steps__divider">
                            <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--border-secondary)" strokeWidth="2" strokeDasharray="4 4" /></svg>
                        </div>
                        <div className="steps__item" id="step-3">
                            <div className="steps__number">03</div>
                            <h3 className="steps__title">Track & Optimize</h3>
                            <p className="steps__desc">
                                Watch clicks roll in. Analyze device types, referrers, and trends over time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Pricing Section ───────────────────────────────────────────────── */}
            <section className="pricing" id="pricing">
                <div className="pricing__inner container">
                    <div className="features__header">
                        <span className="features__eyebrow">Pricing</span>
                        <h2 className="features__title">Simple, transparent pricing</h2>
                        <p className="features__subtitle">Start free. Scale when you need to.</p>
                    </div>

                    <div className="pricing__grid">
                        <div className="pricing__card" id="pricing-free">
                            <div className="pricing__card-header">
                                <h3 className="pricing__card-name">Starter</h3>
                                <div className="pricing__card-price">
                                    <span className="pricing__card-amount">$0</span>
                                    <span className="pricing__card-period">/month</span>
                                </div>
                                <p className="pricing__card-desc">Perfect for personal projects</p>
                            </div>
                            <ul className="pricing__card-features">
                                <li><span className="pricing__check">✓</span> Up to 50 shortened URLs</li>
                                <li><span className="pricing__check">✓</span> Basic click analytics</li>
                                <li><span className="pricing__check">✓</span> Custom slugs</li>
                                <li><span className="pricing__check">✓</span> Link expiration</li>
                                <li><span className="pricing__check">✓</span> REST API access</li>
                            </ul>
                            <Link to="/signup" className="pricing__card-btn pricing__card-btn--outline" id="pricing-free-cta">
                                Get Started Free
                            </Link>
                        </div>

                        <div className="pricing__card pricing__card--featured" id="pricing-pro">
                            <div className="pricing__card-badge">Most Popular</div>
                            <div className="pricing__card-header">
                                <h3 className="pricing__card-name">Pro</h3>
                                <div className="pricing__card-price">
                                    <span className="pricing__card-amount">$12</span>
                                    <span className="pricing__card-period">/month</span>
                                </div>
                                <p className="pricing__card-desc">For growing teams and businesses</p>
                            </div>
                            <ul className="pricing__card-features">
                                <li><span className="pricing__check">✓</span> Unlimited shortened URLs</li>
                                <li><span className="pricing__check">✓</span> Advanced analytics dashboard</li>
                                <li><span className="pricing__check">✓</span> Device & referrer tracking</li>
                                <li><span className="pricing__check">✓</span> Time-series charts</li>
                                <li><span className="pricing__check">✓</span> Priority support</li>
                                <li><span className="pricing__check">✓</span> Custom domain (coming soon)</li>
                            </ul>
                            <Link to="/signup" className="pricing__card-btn pricing__card-btn--primary" id="pricing-pro-cta">
                                Start Pro Trial
                            </Link>
                        </div>

                        <div className="pricing__card" id="pricing-enterprise">
                            <div className="pricing__card-header">
                                <h3 className="pricing__card-name">Enterprise</h3>
                                <div className="pricing__card-price">
                                    <span className="pricing__card-amount">Custom</span>
                                </div>
                                <p className="pricing__card-desc">For large-scale deployments</p>
                            </div>
                            <ul className="pricing__card-features">
                                <li><span className="pricing__check">✓</span> Everything in Pro</li>
                                <li><span className="pricing__check">✓</span> Self-hosted option</li>
                                <li><span className="pricing__check">✓</span> SSO & SAML</li>
                                <li><span className="pricing__check">✓</span> SLA guarantee</li>
                                <li><span className="pricing__check">✓</span> Dedicated support</li>
                            </ul>
                            <a href="mailto:hello@sniplink.app" className="pricing__card-btn pricing__card-btn--outline" id="pricing-enterprise-cta">
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ───────────────────────────────────────────────────── */}
            <section className="cta" id="cta-section">
                <div className="cta__inner container">
                    <div className="cta__glow"></div>
                    <h2 className="cta__title">Ready to shorten smarter?</h2>
                    <p className="cta__subtitle">
                        Join thousands of developers using Sniplink to manage and track their links.
                    </p>
                    <div className="cta__actions">
                        <Link to="/signup" className="cta__btn cta__btn--primary" id="cta-signup-btn">
                            Create Free Account
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
