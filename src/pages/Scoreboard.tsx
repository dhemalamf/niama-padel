import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMatchStore } from '../store/useMatchStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatStandardPoint, getPointSituation } from '../engine/scoringEngine';
import './Scoreboard.css';

export function Scoreboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const match = useMatchStore((s) => s.match);
    const scorePoint = useMatchStore((s) => s.scorePoint);
    const removePoint = useMatchStore((s) => s.removePoint);
    const undoLastPoint = useMatchStore((s) => s.undoLastPoint);
    const toggleServer = useMatchStore((s) => s.toggleServer);
    const forceEndMatch = useMatchStore((s) => s.forceEndMatch);
    const clearMatch = useMatchStore((s) => s.clearMatch);
    const undoStack = useMatchStore((s) => s.undoStack);
    const saveMatch = useHistoryStore((s) => s.saveMatch);
    const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

    const [displayMode, setDisplayMode] = useState(false);
    const [flashTeam, setFlashTeam] = useState<0 | 1 | null>(null);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    useEffect(() => {
        if (!match) {
            navigate('/score-board/setup');
        }
    }, [match, navigate]);

    useEffect(() => {
        if (match?.status === 'completed' && !showCompleted) {
            setShowCompleted(true);
        }
    }, [match?.status, showCompleted]);

    const triggerHaptic = useCallback(() => {
        if (hapticEnabled && navigator.vibrate) {
            navigator.vibrate(30);
        }
    }, [hapticEnabled]);

    const handleScore = useCallback((teamIndex: 0 | 1) => {
        triggerHaptic();
        setFlashTeam(teamIndex);
        scorePoint(teamIndex);
        setTimeout(() => setFlashTeam(null), 300);
    }, [scorePoint, triggerHaptic]);

    const handleRemovePoint = useCallback((teamIndex: 0 | 1) => {
        triggerHaptic();
        removePoint(teamIndex);
    }, [removePoint, triggerHaptic]);

    if (!match) return null;

    const { config, currentGame, sets, currentSetIndex, teams } = match;
    const isGeneral = config.mode === 'general';
    const isRally = config.mode === 'rally';
    const isStandard = config.mode === 'standard' || config.mode === 'goldenPoint';
    const situation = getPointSituation(match);

    // Format points display
    const getPointDisplay = (teamIndex: 0 | 1): string => {
        const pts = teamIndex === 0 ? currentGame.pointsA : currentGame.pointsB;

        if (isGeneral || isRally) {
            return String(pts);
        }

        if (currentGame.isTieBreak || currentGame.isMatchTieBreak) {
            return String(pts);
        }

        return formatStandardPoint(
            pts,
            teamIndex === 0 ? currentGame.pointsB : currentGame.pointsA,
            currentGame.advantage,
            teamIndex === 0
        );
    };

    // Completed screen
    if (showCompleted && match.status === 'completed') {
        const winnerTeam = match.winner !== null ? teams[match.winner] : null;

        return (
            <div className="page container scoreboard-page animate-scaleIn">
                <div className="completed-screen">
                    <div className="completed-trophy">🏆</div>
                    <h1 className="completed-title">{t('match.completed')}</h1>
                    {winnerTeam && (
                        <h2 className="completed-winner">
                            {t('match.winner', { team: winnerTeam.name })}
                        </h2>
                    )}

                    <div className="completed-scores card">
                        <div className="completed-team-row">
                            <span className={`completed-team-name ${match.winner === 0 ? 'text-accent' : ''}`}>
                                {teams[0].name}
                            </span>
                            <div className="completed-set-scores">
                                {sets.map((s, i) => (
                                    <span key={i} className="completed-set-badge">{s.gamesA}</span>
                                ))}
                            </div>
                        </div>
                        <div className="completed-divider" />
                        <div className="completed-team-row">
                            <span className={`completed-team-name ${match.winner === 1 ? 'text-accent' : ''}`}>
                                {teams[1].name}
                            </span>
                            <div className="completed-set-scores">
                                {sets.map((s, i) => (
                                    <span key={i} className="completed-set-badge">{s.gamesB}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="completed-actions">
                        <button
                            className="btn btn-primary btn-lg btn-full"
                            onClick={() => {
                                saveMatch(match);
                                clearMatch();
                                navigate('/score-board');
                            }}
                        >
                            {t('match.saveMatch')}
                        </button>
                        <button
                            className="btn btn-secondary btn-lg btn-full"
                            onClick={() => {
                                clearMatch();
                                navigate('/score-board/setup');
                            }}
                        >
                            {t('match.newMatch')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Display mode (score only)
    if (displayMode) {
        return (
            <div className="display-mode" onClick={() => setDisplayMode(false)}>
                <div className="display-score-container">
                    <div className="display-team">
                        <span className="display-team-name">{teams[0].name}</span>
                        <span className="display-points">{getPointDisplay(0)}</span>
                    </div>
                    <div className="display-separator">–</div>
                    <div className="display-team">
                        <span className="display-team-name">{teams[1].name}</span>
                        <span className="display-points">{getPointDisplay(1)}</span>
                    </div>
                </div>
                {isStandard && (
                    <div className="display-sets">
                        {sets.map((s, i) => (
                            <span key={i} className="display-set">{s.gamesA}–{s.gamesB}</span>
                        ))}
                    </div>
                )}
                <p className="display-exit-hint">{t('scoreboard.exitDisplay')}</p>
            </div>
        );
    }

    const currentSet = sets[currentSetIndex];

    return (
        <div className="page container scoreboard-page">
            {/* Match name & situation badge */}
            <div className="sb-header">
                <h3 className="sb-match-name">{match.name}</h3>
                {situation && (
                    <span className={`sb-situation-badge ${situation === 'matchPoint' ? 'match-point' : ''}`}>
                        {t(`scoreboard.${situation}`)}
                    </span>
                )}
            </div>

            {/* Set scores row (standard modes) */}
            {isStandard && (
                <div className="sb-sets-row">
                    <div className="sb-sets-team">
                        <span className="sb-team-initial">{teams[0].name}</span>
                        {sets.map((s, i) => (
                            <span key={i} className={`sb-set-value ${i === currentSetIndex ? 'current' : ''}`}>
                                {s.gamesA}
                            </span>
                        ))}
                    </div>
                    <div className="sb-sets-team">
                        <span className="sb-team-initial">{teams[1].name}</span>
                        {sets.map((s, i) => (
                            <span key={i} className={`sb-set-value ${i === currentSetIndex ? 'current' : ''}`}>
                                {s.gamesB}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Tie-break indicator */}
            {(currentGame.isTieBreak || currentGame.isMatchTieBreak) && (
                <div className="sb-tiebreak-badge">
                    {currentGame.isMatchTieBreak ? t('scoreboard.matchTieBreak') : t('scoreboard.tieBreak')}
                </div>
            )}

            {/* Deuce indicator */}
            {isStandard && currentGame.pointsA === 40 && currentGame.pointsB === 40 && currentGame.advantage === 'none' && !currentGame.isTieBreak && (
                <div className="sb-deuce-badge">{t('scoreboard.deuce')}</div>
            )}

            {/* Main score display */}
            <div className="sb-score-display">
                {/* Team A */}
                <div className={`sb-score-side ${flashTeam === 0 ? 'flash' : ''}`}>
                    <div className="sb-team-label">
                        <span className="sb-team-name">{teams[0].name}</span>
                        {currentGame.server === 0 && (
                            <span className="sb-serve-indicator" title={t('scoreboard.serving')}>●</span>
                        )}
                    </div>
                    <div className={`sb-points ${flashTeam === 0 ? 'animate-scoreFlash' : ''}`}>
                        {getPointDisplay(0)}
                    </div>
                    {isStandard && !currentGame.isTieBreak && !currentGame.isMatchTieBreak && (
                        <div className="sb-games-in-set">
                            {t('scoreboard.game')}: {currentSet.gamesA}
                        </div>
                    )}
                </div>

                <div className="sb-score-divider">–</div>

                {/* Team B */}
                <div className={`sb-score-side ${flashTeam === 1 ? 'flash' : ''}`}>
                    <div className="sb-team-label">
                        <span className="sb-team-name">{teams[1].name}</span>
                        {currentGame.server === 1 && (
                            <span className="sb-serve-indicator" title={t('scoreboard.serving')}>●</span>
                        )}
                    </div>
                    <div className={`sb-points ${flashTeam === 1 ? 'animate-scoreFlash' : ''}`}>
                        {getPointDisplay(1)}
                    </div>
                    {isStandard && !currentGame.isTieBreak && !currentGame.isMatchTieBreak && (
                        <div className="sb-games-in-set">
                            {t('scoreboard.game')}: {currentSet.gamesB}
                        </div>
                    )}
                </div>
            </div>

            {/* Rally target display */}
            {isRally && (
                <div className="sb-rally-target text-tertiary">
                    Target: {config.rallyTarget}
                </div>
            )}

            {/* Score buttons */}
            <div className="sb-controls">
                {isGeneral ? (
                    /* General mode: +/- buttons for each team */
                    <div className="sb-general-controls">
                        <div className="sb-general-team">
                            <span className="sb-general-label">{teams[0].name}</span>
                            <div className="sb-general-btns">
                                <button className="btn btn-destructive sb-minus-btn" onClick={() => handleRemovePoint(0)}>
                                    −
                                </button>
                                <button className="btn btn-primary sb-plus-btn" onClick={() => handleScore(0)}>
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="sb-general-team">
                            <span className="sb-general-label">{teams[1].name}</span>
                            <div className="sb-general-btns">
                                <button className="btn btn-destructive sb-minus-btn" onClick={() => handleRemovePoint(1)}>
                                    −
                                </button>
                                <button className="btn btn-primary sb-plus-btn" onClick={() => handleScore(1)}>
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Standard / Rally: +1 point buttons */
                    <div className="sb-point-buttons">
                        <button
                            className="btn btn-primary sb-point-btn sb-point-a"
                            onClick={() => handleScore(0)}
                        >
                            +1 {teams[0].name}
                        </button>
                        <button
                            className="btn btn-primary sb-point-btn sb-point-b"
                            onClick={() => handleScore(1)}
                        >
                            +1 {teams[1].name}
                        </button>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="sb-actions">
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={undoLastPoint}
                    disabled={undoStack.length === 0}
                    title={t('scoreboard.undo')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>

                {!isGeneral && (
                    <button className="btn btn-ghost btn-icon" onClick={toggleServer} title={t('scoreboard.changeServer')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="17 1 21 5 17 9" />
                            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                            <polyline points="7 23 3 19 7 15" />
                            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                    </button>
                )}

                <button className="btn btn-ghost btn-icon" onClick={() => setDisplayMode(true)} title={t('scoreboard.displayMode')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                </button>

                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setShowEndConfirm(true)}
                    title={t('scoreboard.endMatch')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <rect x="8" y="8" width="8" height="8" fill="currentColor" />
                    </svg>
                </button>
            </div>

            {/* End match confirmation */}
            {showEndConfirm && (
                <div className="sb-modal-overlay" onClick={() => setShowEndConfirm(false)}>
                    <div className="sb-modal card" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('scoreboard.endMatch')}</h3>
                        <p className="text-secondary" style={{ margin: 'var(--space-base) 0' }}>
                            Select the winning team:
                        </p>
                        <div className="sb-modal-actions">
                            <button className="btn btn-primary btn-full" onClick={() => { forceEndMatch(0); setShowEndConfirm(false); }}>
                                {teams[0].name}
                            </button>
                            <button className="btn btn-secondary btn-full" onClick={() => { forceEndMatch(1); setShowEndConfirm(false); }}>
                                {teams[1].name}
                            </button>
                            <button className="btn btn-ghost btn-full" onClick={() => setShowEndConfirm(false)}>
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
