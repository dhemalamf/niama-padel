import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatchStore } from '../store/useMatchStore';
import type { PresetId } from '../types';
import './CustomMatchDrawer.css';

const PRESETS: { id: PresetId; label: string; setsOptions: number[] }[] = [
    { id: 'official', label: 'Official Padel', setsOptions: [1, 2, 3] }, // Standard scoring
    { id: 'fastSocial', label: 'Fast Social Set', setsOptions: [1] },    // Short set
    { id: 'tieBreakMatch', label: 'Tie-Break Match', setsOptions: [3] },  // Super tie-break for 3rd
];

interface CustomMatchDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CustomMatchDrawer({ isOpen, onClose }: CustomMatchDrawerProps) {
    const { t } = useTranslation();
    const createMatch = useMatchStore(s => s.createMatch);

    // Form state
    const [matchName, setMatchName] = useState('');
    const [teamA, setTeamA] = useState('HOME');
    const [teamB, setTeamB] = useState('AWAY');
    const [presetId, setPresetId] = useState<PresetId>('official');
    const [setsToWin, setSetsToWin] = useState(1);

    // When preset changes, ensure valid sets
    useEffect(() => {
        const preset = PRESETS.find(p => p.id === presetId);
        if (preset && !preset.setsOptions.includes(setsToWin)) {
            setSetsToWin(preset.setsOptions[0]);
        }
    }, [presetId, setsToWin]);

    // Reset form when opened
    useEffect(() => {
        if (isOpen) {
            setMatchName('');
            setTeamA('HOME');
            setTeamB('AWAY');
            setPresetId('official');
            setSetsToWin(1);
        }
    }, [isOpen]);

    const handleStart = () => {
        const finalName = matchName.trim() || t('match.defaultName');
        const finalTeamA = teamA.trim() || 'HOME';
        const finalTeamB = teamB.trim() || 'AWAY';

        let config;

        if (presetId === 'fastSocial') {
            config = {
                mode: 'standard' as const,
                gamesPerSet: 4,
                setsToWin: 1,
                tieBreakAt: 4,
                tieBreakPoints: 7,
                useMatchTieBreak: false,
                matchTieBreakPoints: 10,
                rallyTarget: 21,
                rallyWinByTwo: true
            };
        } else if (presetId === 'tieBreakMatch') {
            config = {
                mode: 'standard' as const,
                gamesPerSet: 6,
                setsToWin: 2,
                tieBreakAt: 6,
                tieBreakPoints: 7,
                useMatchTieBreak: true,
                matchTieBreakPoints: 10,
                rallyTarget: 21,
                rallyWinByTwo: true
            };
        } else {
            // Official Official
            config = {
                mode: 'standard' as const,
                gamesPerSet: 6,
                setsToWin: setsToWin,
                tieBreakAt: 6,
                tieBreakPoints: 7,
                useMatchTieBreak: false,
                matchTieBreakPoints: 10,
                rallyTarget: 21,
                rallyWinByTwo: true
            };
        }

        createMatch({
            name: finalName,
            teams: [
                { id: 'team-a', players: [{ id: 'p1', name: 'Player 1' }], name: finalTeamA, color: '#55E0B4' },
                { id: 'team-b', players: [{ id: 'p2', name: 'Player 2' }], name: finalTeamB, color: '#FF5C5C' }
            ],
            config,
            presetId,
            initialServer: 0
        });

        onClose();
    };

    return (
        <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="drawer-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <h2>Custom Match</h2>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="drawer-content">
                    {/* Match Name */}
                    <div className="drawer-form-group">
                        <label>{t('setup.matchNameTitle')}</label>
                        <input
                            className="sb-input"
                            type="text"
                            placeholder={t('setup.matchNamePlaceholder')}
                            value={matchName}
                            onChange={(e) => setMatchName(e.target.value)}
                        />
                    </div>

                    {/* Format/Preset */}
                    <div className="drawer-form-group">
                        <label>Format</label>
                        <div className="preset-grid">
                            {PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    className={`preset-card ${presetId === preset.id ? 'selected' : ''}`}
                                    onClick={() => setPresetId(preset.id)}
                                >
                                    <span className="preset-name">{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sets Selection */}
                    {PRESETS.find(p => p.id === presetId)?.setsOptions.length !== 1 && (
                        <div className="drawer-form-group">
                            <label>Sets</label>
                            <div className="sets-row">
                                {PRESETS.find(p => p.id === presetId)?.setsOptions.map(n => (
                                    <button
                                        key={n}
                                        className={`btn ${setsToWin === n ? 'btn-primary' : 'btn-secondary'} sets-btn flex-1`}
                                        onClick={() => setSetsToWin(n)}
                                    >
                                        {n === 1 ? '1 Set' : `Best of ${n * 2 - 1}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Teams */}
                    <div className="drawer-form-group teams-group mt-4">
                        <label>Teams</label>
                        <div className="drawer-teams">
                            <input
                                className="sb-input text-center"
                                type="text"
                                value={teamA}
                                onChange={e => setTeamA(e.target.value)}
                                placeholder="Home Team"
                            />
                            <span className="drawer-vs">vs</span>
                            <input
                                className="sb-input text-center"
                                type="text"
                                value={teamB}
                                onChange={e => setTeamB(e.target.value)}
                                placeholder="Away Team"
                            />
                        </div>
                    </div>
                </div>

                <div className="drawer-footer">
                    <button className="btn btn-primary btn-lg btn-full" onClick={handleStart}>
                        Start Match
                    </button>
                </div>
            </div>
        </div>
    );
}
