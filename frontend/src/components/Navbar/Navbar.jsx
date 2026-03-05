import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar" id="main-navbar">
            <div className="navbar__inner container">
                <Link to="/" className="navbar__logo" id="navbar-logo">
                    <span className="navbar__logo-icon">⚡</span>
                    <span className="navbar__logo-text">Sniplink</span>
                </Link>

                <button
                    className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--active' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                    id="navbar-hamburger"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar__menu ${mobileOpen ? 'navbar__menu--open' : ''}`}>
                    {!user ? (
                        <>
                            <Link
                                to="/"
                                className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                                id="nav-link-home"
                            >
                                Home
                            </Link>
                            <a href="/#features" className="navbar__link" onClick={() => setMobileOpen(false)} id="nav-link-features">
                                Features
                            </a>
                            <a href="/#pricing" className="navbar__link" onClick={() => setMobileOpen(false)} id="nav-link-pricing">
                                Pricing
                            </a>
                            <div className="navbar__actions">
                                <Link
                                    to="/login"
                                    className="navbar__btn navbar__btn--ghost"
                                    onClick={() => setMobileOpen(false)}
                                    id="nav-login-btn"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="navbar__btn navbar__btn--primary"
                                    onClick={() => setMobileOpen(false)}
                                    id="nav-signup-btn"
                                >
                                    Get Started Free
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/dashboard"
                                className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                                id="nav-link-dashboard"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/dashboard/urls"
                                className={`navbar__link ${isActive('/dashboard/urls') ? 'navbar__link--active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                                id="nav-link-urls"
                            >
                                My Links
                            </Link>
                            <div className="navbar__actions">
                                <div className="navbar__user" id="navbar-user-info">
                                    <div className="navbar__avatar">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="navbar__username">{user.name}</span>
                                </div>
                                <button
                                    className="navbar__btn navbar__btn--ghost"
                                    onClick={() => { logout(); setMobileOpen(false); }}
                                    id="nav-logout-btn"
                                >
                                    Log out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
