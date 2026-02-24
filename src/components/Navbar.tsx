import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

export function Navbar() {
    const { t } = useTranslation();
    const location = useLocation();

    // Only show the scoreboard navbar when inside /score-board routes
    const isScoreboardSection = location.pathname.startsWith('/score-board');
    if (!isScoreboardSection) return null;

    return (
        <nav className="navbar">
            <NavLink to="/score-board" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Scoreboard</span>
            </NavLink>

            <NavLink to="/score-board/guide" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <span>How to Use</span>
            </NavLink>

            <NavLink to="/score-board/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{t('nav.history')}</span>
            </NavLink>

            <NavLink to="/score-board/account" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span>Account</span>
            </NavLink>
        </nav>
    );
}
