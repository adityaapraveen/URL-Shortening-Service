import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await register(email, password, name);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth" id="signup-page">
            <div className="auth__bg-grid"></div>
            <div className="auth__glow"></div>

            <div className="auth__card">
                <div className="auth__header">
                    <Link to="/" className="auth__logo">
                        <span className="auth__logo-icon">⚡</span>
                        <span className="auth__logo-text">Sniplink</span>
                    </Link>
                    <h1 className="auth__title" id="signup-title">Create your account</h1>
                    <p className="auth__subtitle">Start shortening links in seconds</p>
                </div>

                {error && (
                    <div className="auth__error" id="signup-error">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth__form" id="signup-form">
                    <div className="auth__field">
                        <label htmlFor="signup-name" className="auth__label">Full Name</label>
                        <input
                            id="signup-name"
                            type="text"
                            className="auth__input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="auth__field">
                        <label htmlFor="signup-email" className="auth__label">Email</label>
                        <input
                            id="signup-email"
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
                        <label htmlFor="signup-password" className="auth__label">Password</label>
                        <div className="auth__input-group">
                            <input
                                id="signup-password"
                                type={showPassword ? 'text' : 'password'}
                                className="auth__input"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="auth__toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                                id="signup-toggle-password"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="auth__field">
                        <label htmlFor="signup-confirm-password" className="auth__label">Confirm Password</label>
                        <input
                            id="signup-confirm-password"
                            type="password"
                            className="auth__input"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth__submit"
                        disabled={loading}
                        id="signup-submit-btn"
                    >
                        {loading ? (
                            <span className="auth__spinner"></span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="auth__footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth__footer-link" id="signup-to-login-link">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
