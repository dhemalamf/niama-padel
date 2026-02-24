import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ClubHome.css';

export function ClubHome() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="club-home bg-layered bg-grid">
            {/* Ambient accent blobs */}
            <div className="accent-blob club-blob-1" />
            <div className="accent-blob club-blob-2" />
            <div className="accent-blob club-blob-3" />

            {/* Top nav */}
            <header className="club-nav">
                <div className="club-nav-inner container">
                    <div className="club-brand">
                        <div className="club-logo-mark">NP</div>
                        <span className="club-brand-name">{t('app.name')}</span>
                    </div>
                    <nav className="club-nav-links">
                        <a href="#about" className="club-nav-link">About</a>
                        <a href="#features" className="club-nav-link">Features</a>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/score-board')}>
                            Scoreboard
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="club-hero">
                <div className="club-hero-inner container">
                    <div className="club-hero-badge animate-fadeIn">
                        <span className="club-badge-dot" />
                        Niama Padel Club
                    </div>

                    <h1 className="club-hero-title animate-fadeIn stagger-1">
                        <span className="text-gradient">Where Passion</span>
                        <br />
                        <span className="text-gradient-accent">Meets the Court</span>
                    </h1>

                    <p className="club-hero-sub animate-fadeIn stagger-2">
                        Experience premium padel in the heart of the community.
                        Book courts, track your matches, and join the league.
                    </p>

                    <div className="club-hero-actions animate-fadeIn stagger-3">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/score-board')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Open Scoreboard
                        </button>
                        <a href="#features" className="btn btn-secondary btn-lg">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Bento Feature Grid */}
            <section className="club-features container" id="features">
                <div className="club-section-header animate-fadeIn">
                    <span className="club-section-tag">Features</span>
                    <h2>Why Niama Padel?</h2>
                    <p className="text-muted">Everything you need for the perfect padel experience</p>
                </div>

                <div className="bento-grid">
                    <div className="card card-interactive bento-item bento-wide animate-fadeIn stagger-1">
                        <div className="bento-icon">📊</div>
                        <h3>Live Scoreboard</h3>
                        <p className="text-muted">
                            Free digital scoreboard supporting official padel, golden point, rally scoring, and custom modes. Score, undo, and share — all from your phone.
                        </p>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: 'auto' }} onClick={() => navigate('/score-board')}>
                            Try It Free →
                        </button>
                    </div>

                    <div className="card card-interactive bento-item animate-fadeIn stagger-2">
                        <div className="bento-icon">🎾</div>
                        <h3>Premium Courts</h3>
                        <p className="text-muted">
                            Professional-grade surfaces with perfect lighting for day and night sessions.
                        </p>
                    </div>

                    <div className="card card-interactive bento-item animate-fadeIn stagger-3">
                        <div className="bento-icon">👥</div>
                        <h3>Community</h3>
                        <p className="text-muted">
                            Weekly social nights, tournaments, and meetups for all skill levels.
                        </p>
                    </div>

                    <div className="card card-interactive bento-item animate-fadeIn stagger-4">
                        <div className="bento-icon">🏋️</div>
                        <h3>Coaching</h3>
                        <p className="text-muted">
                            Professional coaches for beginners and advanced players alike.
                        </p>
                    </div>

                    <div className="card card-interactive bento-item animate-fadeIn stagger-1">
                        <div className="bento-icon">🌍</div>
                        <h3>Open to All</h3>
                        <p className="text-muted">
                            We provide equipment, coaching, and a warm atmosphere for everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA section */}
            <section className="club-cta" id="about">
                <div className="club-cta-inner container">
                    <div className="club-cta-glow" />
                    <span className="club-section-tag">Get Started</span>
                    <h2 className="text-gradient">Ready to Play?</h2>
                    <p className="text-muted">
                        Use our free scoreboard to track your matches in real time.
                        No signup required.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/score-board')}>
                        Launch Scoreboard
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="club-footer">
                <div className="container club-footer-inner">
                    <div className="club-footer-brand">
                        <div className="club-logo-mark small">NP</div>
                        <span>Niama Padel Club</span>
                    </div>
                    <p className="text-subtle" style={{ fontSize: 'var(--fs-xs)' }}>
                        © 2026 Niama Padel Club
                    </p>
                </div>
            </footer>
        </div>
    );
}
