import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth" id="login-page">
            <div className="auth__bg-grid"></div>
            <div className="auth__glow"></div>

            <div className="auth__card">
                <div className="auth__header">
                    <Link to="/" className="auth__logo">
                        <span className="auth__logo-icon">⚡</span>
                        <span className="auth__logo-text">Sniplink</span>
                    </Link>
                    <h1 className="auth__title" id="login-title">Welcome back</h1>
                    <p className="auth__subtitle">Sign in to manage your shortened links</p>
                </div>

                {error && (
                    <div className="auth__error" id="login-error">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth__form" id="login-form">
                    <div className="auth__field">
                        <label htmlFor="login-email" className="auth__label">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            className="auth__input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth__field">
                        <label htmlFor="login-password" className="auth__label">Password</label>
                        <div className="auth__input-group">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                className="auth__input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="auth__toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                                id="login-toggle-password"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth__submit"
                        disabled={loading}
                        id="login-submit-btn"
                    >
                        {loading ? (
                            <span className="auth__spinner"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="auth__footer">
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth__footer-link" id="login-to-signup-link">
                        Create one for free
                    </Link>
                </p>
            </div>
        </div>
    );
}
