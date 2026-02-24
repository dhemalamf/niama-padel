import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatchStore } from '../store/useMatchStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getPointSituation, formatStandardPoint } from '../engine/scoringEngine';
import { TeamEditor } from '../components/TeamEditor';
import { CustomMatchDrawer } from '../components/CustomMatchDrawer';
import './Home.css';

type ScoringMode = 'general' | 'standard';
const MODE_STORAGE_KEY = 'niama-scoring-mode';

function getSavedMode(): ScoringMode {
    try {
        const saved = localStorage.getItem(MODE_STORAGE_KEY);
        if (saved === 'standard' || saved === 'general') return saved;
    } catch { /* ignore */ }
    return 'general'; // Free is default
}

export function Home() {
    const { t } = useTranslation();
    const match = useMatchStore((s) => s.match);
    const initQuickMatch = useMatchStore((s) => s.initQuickMatch);
    const switchScoringMode = useMatchStore((s) => s.switchScoringMode);
    const updateTeam = useMatchStore((s) => s.updateTeam);
    const swapTeams = useMatchStore((s) => s.swapTeams);
    const resetCurrentMatch = useMatchStore((s) => s.resetCurrentMatch);
    const scorePoint = useMatchStore((s) => s.scorePoint);
    const removePoint = useMatchStore((s) => s.removePoint);
    const undoLastPoint = useMatchStore((s) => s.undoLastPoint);
    const undoStack = useMatchStore((s) => s.undoStack);

    const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

    const [activeMode, setActiveMode] = useState<ScoringMode>(getSavedMode);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [flashTeam, setFlashTeam] = useState<0 | 1 | null>(null);

    // Initialize the zero-friction scoreboard on load
    useEffect(() => {
        initQuickMatch(activeMode);
    }, [initQuickMatch, activeMode]);

    const handleModeSwitch = useCallback((mode: ScoringMode) => {
        if (mode === activeMode) return;
        setActiveMode(mode);
        localStorage.setItem(MODE_STORAGE_KEY, mode);
        switchScoringMode(mode);
    }, [activeMode, switchScoringMode]);

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

    // Ensure match exists before rendering main UI
    if (!match) return null;

    const { config, currentGame, sets, currentSetIndex, teams } = match;
    const isGeneral = config.mode === 'general';
    const isRally = config.mode === 'rally';
    const isStandard = config.mode === 'standard' || config.mode === 'goldenPoint';

    const currentSet = sets[currentSetIndex] || { gamesA: 0, gamesB: 0 };
    const situation = getPointSituation(match);

    const getPointDisplay = (teamIndex: 0 | 1): string => {
        const pts = teamIndex === 0 ? currentGame.pointsA : currentGame.pointsB;
        if (isGeneral || isRally) return String(pts);
        if (currentGame.isTieBreak || currentGame.isMatchTieBreak) return String(pts);

        return formatStandardPoint(
            pts,
            teamIndex === 0 ? currentGame.pointsB : currentGame.pointsA,
            currentGame.advantage,
            teamIndex === 0
        );
    };

    return (
        <div className="page container home-page">
            <header className="immediate-header">
                <div className="home-logo">
                    <span className="home-logo-icon">NP</span>
                    <h2>Niama Scoreboard</h2>
                </div>

                <div className="immediate-actions">
                    <button
                        className="btn btn-icon btn-ghost"
                        onClick={undoLastPoint}
                        disabled={undoStack.length === 0}
                        title="Undo"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                    </button>
                    <button className="btn btn-icon btn-ghost" onClick={resetCurrentMatch} title="Reset Score">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    </button>
                    <button className="btn btn-icon btn-ghost" onClick={swapTeams} title="Swap Sides">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 8 16 13" /><line x1="21" y1="8" x2="9" y2="8" /><polyline points="8 21 3 16 8 11" /><line x1="3" y1="16" x2="15" y2="16" /></svg>
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        Custom Match
                    </button>
                </div>
            </header>

            {/* Scoring Mode Toggle */}
            <div className="scoring-mode-toggle">
                <button
                    className={`mode-pill ${activeMode === 'general' ? 'active' : ''}`}
                    onClick={() => handleModeSwitch('general')}
                >
                    🔢 Free
                </button>
                <button
                    className={`mode-pill ${activeMode === 'standard' ? 'active' : ''}`}
                    onClick={() => handleModeSwitch('standard')}
                >
                    🎾 Tennis
                </button>
            </div>

            {/* Main Scoreboard Display */}
            <main className="immediate-scoreboard card bg-elevated">
                {/* Match Info Badge / Title */}
                <div className="im-sb-header">
                    <span className="im-sb-name">{match.name}</span>
                    {situation && (
                        <span className={`sb-badge ${situation === 'matchPoint' ? 'match-point' : ''}`}>
                            {t(`scoreboard.${situation}`)}
                        </span>
                    )}
                </div>

                {/* Score Section */}
                <div className="im-sb-scores">
                    {/* HOME TEAM */}
                    <div className="im-team-col">
                        <TeamEditor
                            initialName={teams[0].name}
                            initialColor={teams[0].color}
                            onSave={(name, color) => updateTeam(0, name, color)}
                            align="left"
                        />
                        <div className={`im-score-display ${flashTeam === 0 ? 'flash' : ''}`} style={{ color: teams[0].color }}>
                            {getPointDisplay(0)}
                        </div>
                        {isStandard && (
                            <div className="im-set-games text-subtle">
                                {t('scoreboard.game')} {currentSet.gamesA}
                            </div>
                        )}
                        <div className="im-controls">
                            <button className="im-btn im-btn-plus" onClick={() => handleScore(0)}>+</button>
                            <button className="im-btn im-btn-minus" onClick={() => handleRemovePoint(0)}>−</button>
                        </div>
                    </div>

                    <div className="im-divider">
                        <div className="im-divider-line"></div>
                        <div className="im-set-status">
                            {isStandard && (
                                <div className="im-sets-row">
                                    {sets.map((s, i) => (
                                        <span key={i} className="im-set-pill">
                                            {s.gamesA}-{s.gamesB}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {isGeneral && (
                                <span className="im-vs-label">VS</span>
                            )}
                        </div>
                        <div className="im-divider-line"></div>
                    </div>

                    {/* AWAY TEAM */}
                    <div className="im-team-col right">
                        <TeamEditor
                            initialName={teams[1].name}
                            initialColor={teams[1].color}
                            onSave={(name, color) => updateTeam(1, name, color)}
                            align="right"
                        />
                        <div className={`im-score-display ${flashTeam === 1 ? 'flash' : ''}`} style={{ color: teams[1].color }}>
                            {getPointDisplay(1)}
                        </div>
                        {isStandard && (
                            <div className="im-set-games text-subtle">
                                {t('scoreboard.game')} {currentSet.gamesB}
                            </div>
                        )}
                        <div className="im-controls">
                            <button className="im-btn im-btn-minus" onClick={() => handleRemovePoint(1)}>−</button>
                            <button className="im-btn im-btn-plus" onClick={() => handleScore(1)}>+</button>
                        </div>
                    </div>
                </div>

                {/* Deuce/Tiebreak Overlay */}
                <div className="im-badges-overlay">
                    {(currentGame.isTieBreak || currentGame.isMatchTieBreak) && (
                        <div className="sb-badge tiebreak">{currentGame.isMatchTieBreak ? "Match Tie-Break" : "Tie-Break"}</div>
                    )}
                    {isStandard && currentGame.pointsA === 40 && currentGame.pointsB === 40 && currentGame.advantage === 'none' && !currentGame.isTieBreak && (
                        <div className="sb-badge deuce">Deuce</div>
                    )}
                </div>
            </main>

            {/* Quick Stats & Context */}
            <section className="im-context">
                <div className="im-stat-bar">
                    {isStandard && (
                        <>
                            <div className="im-stat">
                                <span className="im-stat-label">Server</span>
                                <span className="im-stat-val" style={{ color: teams[currentGame.server].color }}>
                                    {teams[currentGame.server].name}
                                </span>
                            </div>
                            <div className="im-stat">
                                <span className="im-stat-label">Set</span>
                                <span className="im-stat-val">{currentSetIndex + 1} / {config.setsToWin}</span>
                            </div>
                        </>
                    )}
                    {isGeneral && (
                        <div className="im-stat">
                            <span className="im-stat-label">Mode</span>
                            <span className="im-stat-val">Free Score</span>
                        </div>
                    )}
                </div>

                <div className="im-marketing">
                    <p className="text-muted"><strong>Made for Niama Padel Club</strong></p>
                    <p className="text-subtle">Free • No login • Works offline</p>
                </div>
            </section>

            <CustomMatchDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </div>
    );
}

