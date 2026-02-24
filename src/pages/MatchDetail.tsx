import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../store/useHistoryStore';
import './MatchDetail.css';

export function MatchDetail() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const getMatch = useHistoryStore((s) => s.getMatch);
    const deleteMatch = useHistoryStore((s) => s.deleteMatch);

    const match = id ? getMatch(id) : undefined;

    if (!match) {
        return (
            <div className="page container match-detail-page">
                <p className="text-tertiary text-center">Match not found</p>
                <button className="btn btn-secondary" onClick={() => navigate('/score-board/history')}>
                    {t('common.back')}
                </button>
            </div>
        );
    }

    const winnerTeam = match.winner !== null ? match.teams[match.winner] : null;

    const handleShare = async () => {
        const text = generateShareText(match);
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Niama Padel Score', text });
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(text);
            alert('Score copied to clipboard!');
        }
    };

    const handleDelete = () => {
        if (window.confirm(t('match.confirmDelete'))) {
            deleteMatch(match.id);
            navigate('/score-board/history');
        }
    };

    return (
        <div className="page container match-detail-page animate-fadeIn">
            <button className="btn btn-ghost back-btn" onClick={() => navigate('/score-board/history')}>
                ← {t('common.back')}
            </button>

            {/* Match header */}
            <div className="detail-header">
                <h2>{match.name || 'Match'}</h2>
                <span className="text-tertiary" style={{ fontSize: 'var(--fs-sm)' }}>
                    {new Date(match.createdAt).toLocaleString()}
                </span>
            </div>

            {/* Winner */}
            {winnerTeam && (
                <div className="detail-winner">
                    <span className="detail-trophy">🏆</span>
                    <span>{t('match.winner', { team: winnerTeam.name })}</span>
                </div>
            )}

            {/* Score table */}
            <div className="card detail-scores">
                <h4 className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                    {t('match.setScores')}
                </h4>

                <div className="detail-score-table">
                    <div className="detail-score-row header-row">
                        <span className="detail-team-col"></span>
                        {match.sets.map((_, i) => (
                            <span key={i} className="detail-set-col">S{i + 1}</span>
                        ))}
                        <span className="detail-set-col total-col">{t('history.sets')}</span>
                    </div>

                    <div className={`detail-score-row ${match.winner === 0 ? 'winner-row' : ''}`}>
                        <span className="detail-team-col">{match.teams[0].name}</span>
                        {match.sets.map((s, i) => (
                            <span key={i} className="detail-set-col">{s.gamesA}</span>
                        ))}
                        <span className="detail-set-col total-col">{match.setsWonA}</span>
                    </div>

                    <div className={`detail-score-row ${match.winner === 1 ? 'winner-row' : ''}`}>
                        <span className="detail-team-col">{match.teams[1].name}</span>
                        {match.sets.map((s, i) => (
                            <span key={i} className="detail-set-col">{s.gamesB}</span>
                        ))}
                        <span className="detail-set-col total-col">{match.setsWonB}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="card detail-stats">
                <h4 className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                    {t('match.totalGames')}
                </h4>
                <div className="detail-stat-row">
                    <span>{match.teams[0].name}</span>
                    <div className="detail-stat-bar-container">
                        <div
                            className="detail-stat-bar bar-a"
                            style={{
                                width: `${(match.totalGamesA / Math.max(match.totalGamesA + match.totalGamesB, 1)) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="detail-stat-value">{match.totalGamesA}</span>
                </div>
                <div className="detail-stat-row">
                    <span>{match.teams[1].name}</span>
                    <div className="detail-stat-bar-container">
                        <div
                            className="detail-stat-bar bar-b"
                            style={{
                                width: `${(match.totalGamesB / Math.max(match.totalGamesA + match.totalGamesB, 1)) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="detail-stat-value">{match.totalGamesB}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
                <button className="btn btn-primary btn-full" onClick={handleShare}>
                    {t('match.shareScore')}
                </button>
                <button className="btn btn-secondary btn-full" onClick={() => navigate('/score-board/setup')}>
                    {t('match.newMatch')}
                </button>
                <button className="btn btn-destructive btn-full" onClick={handleDelete}>
                    {t('match.deleteMatch')}
                </button>
            </div>
        </div>
    );
}

function generateShareText(match: {
    name: string;
    teams: [{ name: string }, { name: string }];
    sets: { gamesA: number; gamesB: number }[];
    winner: 0 | 1 | null;
}) {
    const setsStr = match.sets.map((s) => `${s.gamesA}–${s.gamesB}`).join(' | ');
    const winner = match.winner !== null ? match.teams[match.winner].name : 'Draw';
    return `🏓 ${match.name}\n${match.teams[0].name} vs ${match.teams[1].name}\n${setsStr}\n🏆 ${winner}\n\nScored with Niama Padel`;
}
