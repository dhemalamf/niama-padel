import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../store/useHistoryStore';
import './History.css';

export function History() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const matches = useHistoryStore((s) => s.matches);
    const deleteMatch = useHistoryStore((s) => s.deleteMatch);

    return (
        <div className="page container history-page animate-fadeIn">
            <h1>{t('history.title')}</h1>

            {matches.length === 0 ? (
                <div className="history-empty card">
                    <p className="text-tertiary">{t('history.noMatches')}</p>
                </div>
            ) : (
                <div className="history-list">
                    {matches.map((match) => (
                        <div key={match.id} className="card history-card" onClick={() => navigate(`/score-board/history/${match.id}`)}>
                            <div className="history-card-header">
                                <span className="history-match-name">{match.name || 'Match'}</span>
                                <span className="text-tertiary" style={{ fontSize: 'var(--fs-xs)' }}>
                                    {new Date(match.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="history-teams-row">
                                <div className="history-team">
                                    <span className={`history-team-name ${match.winner === 0 ? 'winner' : ''}`}>
                                        {match.teams[0].name}
                                        {match.winner === 0 && <span className="winner-badge">🏆</span>}
                                    </span>
                                </div>
                                <div className="history-scores">
                                    {match.sets.map((s, i) => (
                                        <div key={i} className="history-set-col">
                                            <span className={match.winner === 0 ? 'text-accent' : ''}>{s.gamesA}</span>
                                            <span className={match.winner === 1 ? 'text-accent' : ''}>{s.gamesB}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="history-team history-team-right">
                                    <span className={`history-team-name ${match.winner === 1 ? 'winner' : ''}`}>
                                        {match.winner === 1 && <span className="winner-badge">🏆</span>}
                                        {match.teams[1].name}
                                    </span>
                                </div>
                            </div>

                            <button
                                className="history-delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(t('match.confirmDelete'))) {
                                        deleteMatch(match.id);
                                    }
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Ad zone */}
            <div className="ad-zone">
                <div className="ad-placeholder">
                    <span className="text-disabled" style={{ fontSize: 'var(--fs-xs)' }}>AD</span>
                </div>
            </div>
        </div>
    );
}
