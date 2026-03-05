import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'links', label: 'My Links', icon: '🔗' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
    ];

    return (
        <aside className="sidebar" id="dashboard-sidebar">
            <nav className="sidebar__nav">
                <div className="sidebar__section-label">Navigation</div>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar__item ${activeTab === item.id ? 'sidebar__item--active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                        id={`sidebar-${item.id}`}
                    >
                        <span className="sidebar__item-icon">{item.icon}</span>
                        <span className="sidebar__item-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar__footer">
                <div className="sidebar__user">
                    <div className="sidebar__avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar__user-info">
                        <span className="sidebar__user-name">{user?.name}</span>
                        <span className="sidebar__user-email">{user?.email}</span>
                    </div>
                </div>
                <button className="sidebar__logout" onClick={logout} id="sidebar-logout">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3.333A1.333 1.333 0 012 12.667V3.333A1.333 1.333 0 013.333 2H6M10.667 11.333L14 8l-3.333-3.333M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
