import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { urlAPI, analyticsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardStats, setDashboardStats] = useState(null);
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create URL form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        original_url: '',
        custom_slug: '',
        title: '',
        expires_at: '',
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    // URL detail analytics
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [urlStats, setUrlStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, urlsRes] = await Promise.all([
                analyticsAPI.getDashboard(),
                urlAPI.getAll(),
            ]);
            setDashboardStats(statsRes.data);
            setUrls(urlsRes.data.urls);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateUrl = async (e) => {
        e.preventDefault();
        setCreateError('');
        setCreateSuccess('');
        setCreateLoading(true);

        try {
            const body = { original_url: createForm.original_url };
            if (createForm.custom_slug) body.custom_slug = createForm.custom_slug;
            if (createForm.title) body.title = createForm.title;
            if (createForm.expires_at) body.expires_at = createForm.expires_at;

            const res = await urlAPI.create(body);
            setCreateSuccess(`Link created: ${res.data.url.short_url}`);
            setCreateForm({ original_url: '', custom_slug: '', title: '', expires_at: '' });
            fetchData();

            // Auto-hide success after 5s
            setTimeout(() => setCreateSuccess(''), 5000);
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteUrl = async (id) => {
        if (!window.confirm('Are you sure? This will delete the link and all its analytics.')) return;
        try {
            await urlAPI.delete(id);
            fetchData();
            if (selectedUrl?.id === id) {
                setSelectedUrl(null);
                setUrlStats(null);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleActive = async (id, currentActive) => {
        try {
            await urlAPI.update(id, { is_active: !currentActive });
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleViewStats = async (url) => {
        setSelectedUrl(url);
        setStatsLoading(true);
        try {
            const res = await analyticsAPI.getUrlStats(url.id);
            setUrlStats(res.data);
        } catch (err) {
            alert(err.message);
        } finally {
            setStatsLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="dashboard" id="dashboard-page">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="dashboard__main">
                    <div className="dashboard__loading">
                        <div className="dashboard__loading-spinner"></div>
                        <p>Loading your dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard" id="dashboard-page">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="dashboard__main">
                {/* ─── Top Bar ───────────────────────────────────────────────── */}
                <header className="dashboard__topbar">
                    <div>
                        <h1 className="dashboard__greeting" id="dashboard-greeting">
                            Welcome, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="dashboard__greeting-sub">Here's what's happening with your links</p>
                    </div>
                    <button
                        className="dashboard__create-btn"
                        onClick={() => { setShowCreateForm(!showCreateForm); setActiveTab('overview'); }}
                        id="create-link-btn"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        New Link
                    </button>
                </header>

                {error && <div className="dashboard__error">{error}</div>}

                {/* ─── Create Form ───────────────────────────────────────────── */}
                {showCreateForm && (
                    <div className="dashboard__create-section" id="create-url-section">
                        <div className="dashboard__create-card">
                            <h2 className="dashboard__create-title">Shorten a new link</h2>

                            {createError && <div className="dashboard__alert dashboard__alert--error">{createError}</div>}
                            {createSuccess && <div className="dashboard__alert dashboard__alert--success">{createSuccess}</div>}

                            <form onSubmit={handleCreateUrl} className="dashboard__create-form" id="create-url-form">
                                <div className="dashboard__create-row">
                                    <div className="dashboard__create-field dashboard__create-field--full">
                                        <label>Destination URL *</label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/very-long-url..."
                                            value={createForm.original_url}
                                            onChange={(e) => setCreateForm({ ...createForm, original_url: e.target.value })}
                                            required
                                            id="create-url-input"
                                        />
                                    </div>
                                </div>
                                <div className="dashboard__create-row">
                                    <div className="dashboard__create-field">
                                        <label>Custom Slug (optional)</label>
                                        <input
                                            type="text"
                                            placeholder="my-brand"
                                            value={createForm.custom_slug}
                                            onChange={(e) => setCreateForm({ ...createForm, custom_slug: e.target.value })}
                                            id="create-slug-input"
                                        />
                                    </div>
                                    <div className="dashboard__create-field">
                                        <label>Title (optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Marketing Campaign"
                                            value={createForm.title}
                                            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                            id="create-title-input"
                                        />
                                    </div>
                                    <div className="dashboard__create-field">
                                        <label>Expires At (optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={createForm.expires_at}
                                            onChange={(e) => setCreateForm({ ...createForm, expires_at: e.target.value })}
                                            id="create-expires-input"
                                        />
                                    </div>
                                </div>
                                <div className="dashboard__create-actions">
                                    <button type="submit" className="dashboard__btn dashboard__btn--primary" disabled={createLoading} id="create-url-submit">
                                        {createLoading ? <span className="dashboard__spinner"></span> : 'Create Short Link'}
                                    </button>
                                    <button type="button" className="dashboard__btn dashboard__btn--ghost" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ─── Overview Tab ──────────────────────────────────────────── */}
                {activeTab === 'overview' && dashboardStats && (
                    <div className="dashboard__overview" id="overview-section">
                        {/* Stats Cards */}
                        <div className="dashboard__stats-grid">
                            <div className="dashboard__stat-card" id="stat-total-links">
                                <div className="dashboard__stat-icon dashboard__stat-icon--purple">🔗</div>
                                <div className="dashboard__stat-info">
                                    <span className="dashboard__stat-value">{dashboardStats.total_urls}</span>
                                    <span className="dashboard__stat-label">Total Links</span>
                                </div>
                            </div>
                            <div className="dashboard__stat-card" id="stat-total-clicks">
                                <div className="dashboard__stat-icon dashboard__stat-icon--blue">📊</div>
                                <div className="dashboard__stat-info">
                                    <span className="dashboard__stat-value">{dashboardStats.total_clicks.toLocaleString()}</span>
                                    <span className="dashboard__stat-label">Total Clicks</span>
                                </div>
                            </div>
                            <div className="dashboard__stat-card" id="stat-unique-visitors">
                                <div className="dashboard__stat-icon dashboard__stat-icon--green">👥</div>
                                <div className="dashboard__stat-info">
                                    <span className="dashboard__stat-value">{dashboardStats.unique_visitors.toLocaleString()}</span>
                                    <span className="dashboard__stat-label">Unique Visitors</span>
                                </div>
                            </div>
                            <div className="dashboard__stat-card" id="stat-7d-clicks">
                                <div className="dashboard__stat-icon dashboard__stat-icon--orange">🔥</div>
                                <div className="dashboard__stat-info">
                                    <span className="dashboard__stat-value">{dashboardStats.clicks_last_7d}</span>
                                    <span className="dashboard__stat-label">Clicks (7 days)</span>
                                </div>
                            </div>
                        </div>

                        {/* Top URLs */}
                        {dashboardStats.top_urls.length > 0 && (
                            <div className="dashboard__section">
                                <h3 className="dashboard__section-title">Top Performing Links</h3>
                                <div className="dashboard__table-card">
                                    <table className="dashboard__table" id="top-urls-table">
                                        <thead>
                                            <tr>
                                                <th>Link</th>
                                                <th>Original URL</th>
                                                <th>Clicks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardStats.top_urls.map((url) => (
                                                <tr key={url.id}>
                                                    <td>
                                                        <span className="dashboard__slug">/{url.slug}</span>
                                                    </td>
                                                    <td>
                                                        <span className="dashboard__original-url">{url.original_url}</span>
                                                    </td>
                                                    <td>
                                                        <span className="dashboard__click-count">{url.click_count}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Links Tab ─────────────────────────────────────────────── */}
                {activeTab === 'links' && (
                    <div className="dashboard__links" id="links-section">
                        <div className="dashboard__section-header">
                            <h3 className="dashboard__section-title">All Links ({urls.length})</h3>
                        </div>

                        {urls.length === 0 ? (
                            <div className="dashboard__empty">
                                <div className="dashboard__empty-icon">🔗</div>
                                <h3>No links yet</h3>
                                <p>Create your first shortened link to get started</p>
                                <button className="dashboard__btn dashboard__btn--primary" onClick={() => { setShowCreateForm(true); setActiveTab('overview'); }}>
                                    Create Your First Link
                                </button>
                            </div>
                        ) : (
                            <div className="dashboard__url-list">
                                {urls.map((url) => (
                                    <div className="dashboard__url-card" key={url.id} id={`url-card-${url.id}`}>
                                        <div className="dashboard__url-header">
                                            <div className="dashboard__url-main">
                                                <div className="dashboard__url-title-row">
                                                    <h4 className="dashboard__url-title">{url.title || url.slug}</h4>
                                                    <span className={`dashboard__url-status ${url.is_active ? 'dashboard__url-status--active' : 'dashboard__url-status--inactive'}`}>
                                                        {url.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="dashboard__url-links">
                                                    <span className="dashboard__url-short">{url.short_url}</span>
                                                    <button
                                                        className="dashboard__url-copy"
                                                        onClick={() => copyToClipboard(url.short_url)}
                                                        title="Copy short URL"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                                <p className="dashboard__url-original">{url.original_url}</p>
                                            </div>
                                            <div className="dashboard__url-meta">
                                                <span className="dashboard__url-clicks">{url.click_count} clicks</span>
                                                <span className="dashboard__url-date">Created {formatDate(url.created_at)}</span>
                                                {url.expires_at && (
                                                    <span className="dashboard__url-expires">Expires {formatDate(url.expires_at)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="dashboard__url-actions">
                                            <button
                                                className="dashboard__url-action-btn"
                                                onClick={() => handleViewStats(url)}
                                                title="View analytics"
                                            >
                                                📊 Analytics
                                            </button>
                                            <button
                                                className="dashboard__url-action-btn"
                                                onClick={() => handleToggleActive(url.id, url.is_active)}
                                                title={url.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {url.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                                            </button>
                                            <button
                                                className="dashboard__url-action-btn dashboard__url-action-btn--danger"
                                                onClick={() => handleDeleteUrl(url.id)}
                                                title="Delete link"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Analytics Tab ─────────────────────────────────────────── */}
                {activeTab === 'analytics' && (
                    <div className="dashboard__analytics" id="analytics-section">
                        {!selectedUrl ? (
                            <div className="dashboard__empty">
                                <div className="dashboard__empty-icon">📊</div>
                                <h3>Select a link to view analytics</h3>
                                <p>Go to your links and click "Analytics" on any link to see detailed stats</p>
                                <button className="dashboard__btn dashboard__btn--primary" onClick={() => setActiveTab('links')}>
                                    View My Links
                                </button>
                            </div>
                        ) : statsLoading ? (
                            <div className="dashboard__loading">
                                <div className="dashboard__loading-spinner"></div>
                                <p>Loading analytics...</p>
                            </div>
                        ) : urlStats ? (
                            <div className="dashboard__analytics-detail">
                                <div className="dashboard__analytics-header">
                                    <div>
                                        <h3>{urlStats.url.title || urlStats.url.slug}</h3>
                                        <p className="dashboard__analytics-url">{urlStats.url.original_url}</p>
                                    </div>
                                    <button className="dashboard__btn dashboard__btn--ghost" onClick={() => { setSelectedUrl(null); setUrlStats(null); }}>
                                        ← Back
                                    </button>
                                </div>

                                <div className="dashboard__stats-grid">
                                    <div className="dashboard__stat-card">
                                        <div className="dashboard__stat-icon dashboard__stat-icon--blue">🖱️</div>
                                        <div className="dashboard__stat-info">
                                            <span className="dashboard__stat-value">{urlStats.summary.total_clicks}</span>
                                            <span className="dashboard__stat-label">Total Clicks</span>
                                        </div>
                                    </div>
                                    <div className="dashboard__stat-card">
                                        <div className="dashboard__stat-icon dashboard__stat-icon--green">👤</div>
                                        <div className="dashboard__stat-info">
                                            <span className="dashboard__stat-value">{urlStats.summary.unique_visitors}</span>
                                            <span className="dashboard__stat-label">Unique Visitors</span>
                                        </div>
                                    </div>
                                    <div className="dashboard__stat-card">
                                        <div className="dashboard__stat-icon dashboard__stat-icon--purple">📱</div>
                                        <div className="dashboard__stat-info">
                                            <span className="dashboard__stat-value">{urlStats.summary.devices.mobile}</span>
                                            <span className="dashboard__stat-label">Mobile</span>
                                        </div>
                                    </div>
                                    <div className="dashboard__stat-card">
                                        <div className="dashboard__stat-icon dashboard__stat-icon--orange">💻</div>
                                        <div className="dashboard__stat-info">
                                            <span className="dashboard__stat-value">{urlStats.summary.devices.desktop}</span>
                                            <span className="dashboard__stat-label">Desktop</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Device Breakdown */}
                                <div className="dashboard__section">
                                    <h3 className="dashboard__section-title">Device Breakdown</h3>
                                    <div className="dashboard__devices">
                                        {Object.entries(urlStats.summary.devices).map(([device, count]) => (
                                            <div className="dashboard__device-bar" key={device}>
                                                <div className="dashboard__device-info">
                                                    <span className="dashboard__device-name">{device}</span>
                                                    <span className="dashboard__device-count">{count}</span>
                                                </div>
                                                <div className="dashboard__device-track">
                                                    <div
                                                        className="dashboard__device-fill"
                                                        style={{
                                                            width: `${urlStats.summary.total_clicks > 0
                                                                ? (count / urlStats.summary.total_clicks) * 100
                                                                : 0}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Referrers */}
                                {urlStats.referrers.length > 0 && (
                                    <div className="dashboard__section">
                                        <h3 className="dashboard__section-title">Top Referrers</h3>
                                        <div className="dashboard__table-card">
                                            <table className="dashboard__table">
                                                <thead>
                                                    <tr>
                                                        <th>Source</th>
                                                        <th>Clicks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {urlStats.referrers.map((ref, i) => (
                                                        <tr key={i}>
                                                            <td>{ref.source}</td>
                                                            <td><span className="dashboard__click-count">{ref.clicks}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </main>
        </div>
    );
}
