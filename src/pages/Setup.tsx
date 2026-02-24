import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { presets } from '../engine/presets';
import { useMatchStore } from '../store/useMatchStore';
import type { Player, Team, ScoringConfig, PresetId } from '../types';
import './Setup.css';

export function Setup() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const createMatch = useMatchStore((s) => s.createMatch);

    const [matchName, setMatchName] = useState('');
    const [selectedPresetId, setSelectedPresetId] = useState<PresetId>('official');
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerInput, setPlayerInput] = useState('');
    const [teamA, setTeamA] = useState<Player[]>([]);
    const [teamB, setTeamB] = useState<Player[]>([]);
    const [initialServer, setInitialServer] = useState<0 | 1>(0);
    const [setsToWin, setSetsToWin] = useState(2);

    const selectedPreset = presets.find((p) => p.id === selectedPresetId)!;

    const addPlayer = () => {
        const name = playerInput.trim();
        if (!name) return;
        const player: Player = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name,
        };
        setPlayers((prev) => [...prev, player]);
        setPlayerInput('');
    };

    const removePlayer = (id: string) => {
        setPlayers((prev) => prev.filter((p) => p.id !== id));
        setTeamA((prev) => prev.filter((p) => p.id !== id));
        setTeamB((prev) => prev.filter((p) => p.id !== id));
    };

    const assignToTeamA = (player: Player) => {
        setTeamB((prev) => prev.filter((p) => p.id !== player.id));
        setTeamA((prev) => {
            if (prev.find((p) => p.id === player.id)) return prev;
            return [...prev, player];
        });
    };

    const assignToTeamB = (player: Player) => {
        setTeamA((prev) => prev.filter((p) => p.id !== player.id));
        setTeamB((prev) => {
            if (prev.find((p) => p.id === player.id)) return prev;
            return [...prev, player];
        });
    };

    const unassignedPlayers = players.filter(
        (p) => !teamA.find((tp) => tp.id === p.id) && !teamB.find((tp) => tp.id === p.id)
    );

    const canStart = teamA.length >= 1 && teamB.length >= 1;

    const handleStart = () => {
        const config: ScoringConfig = {
            ...selectedPreset.config,
            setsToWin:
                selectedPreset.config.mode === 'rally' || selectedPreset.config.mode === 'general'
                    ? 1
                    : setsToWin,
        };

        const teamAObj: Team = {
            id: 'teamA',
            players: teamA,
            name: teamA.map((p) => p.name).join(' & '),
        };
        const teamBObj: Team = {
            id: 'teamB',
            players: teamB,
            name: teamB.map((p) => p.name).join(' & '),
        };

        createMatch({
            name: matchName || 'Match',
            teams: [teamAObj, teamBObj],
            config,
            presetId: selectedPresetId,
            initialServer,
        });

        navigate('/score-board/match');
    };

    const showSetsSelector =
        selectedPreset.config.mode === 'standard' || selectedPreset.config.mode === 'goldenPoint';

    return (
        <div className="page container setup-page animate-fadeIn">
            <h1>{t('setup.title')}</h1>

            {/* Match Name */}
            <section className="setup-section">
                <label className="setup-label">{t('setup.matchName')}</label>
                <input
                    type="text"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    placeholder={t('setup.matchNamePlaceholder')}
                    className="setup-input"
                />
            </section>

            {/* Scoring Preset */}
            <section className="setup-section">
                <label className="setup-label">{t('setup.scoringPreset')}</label>
                <div className="preset-grid">
                    {presets.map((preset) => (
                        <button
                            key={preset.id}
                            className={`preset-card ${selectedPresetId === preset.id ? 'selected' : ''}`}
                            onClick={() => setSelectedPresetId(preset.id)}
                        >
                            <span className="preset-name">{t(preset.nameKey)}</span>
                            <span className="preset-desc">{t(preset.descriptionKey)}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Number of Sets */}
            {showSetsSelector && (
                <section className="setup-section">
                    <label className="setup-label">{t('setup.numberOfSets')}</label>
                    <div className="sets-selector">
                        {[1, 2, 3].map((n) => (
                            <button
                                key={n}
                                className={`btn ${setsToWin === n ? 'btn-primary' : 'btn-secondary'} sets-btn`}
                                onClick={() => setSetsToWin(n)}
                            >
                                {n === 1 ? '1 Set' : `Best of ${n * 2 - 1}`}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Players */}
            <section className="setup-section">
                <label className="setup-label">{t('setup.players')}</label>
                <div className="player-input-row">
                    <input
                        type="text"
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                        placeholder={t('setup.playerNamePlaceholder')}
                        className="setup-input"
                    />
                    <button className="btn btn-primary" onClick={addPlayer}>{t('setup.addPlayer')}</button>
                </div>

                {players.length > 0 && (
                    <div className="player-chips">
                        {players.map((p) => (
                            <span key={p.id} className="player-chip">
                                {p.name}
                                <button className="chip-remove" onClick={() => removePlayer(p.id)}>×</button>
                            </span>
                        ))}
                    </div>
                )}
            </section>

            {/* Team Assignment */}
            {players.length > 0 && (
                <section className="setup-section">
                    <label className="setup-label">{t('setup.assignTeams')}</label>
                    <p className="text-tertiary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                        {t('setup.tapToAssign')}
                    </p>

                    <div className="team-assignment">
                        {/* Team A */}
                        <div className="team-column">
                            <h4 className="team-header team-a-header">{t('setup.teamA')}</h4>
                            <div className="team-player-list">
                                {teamA.map((p) => (
                                    <div key={p.id} className="team-player team-a-player">{p.name}</div>
                                ))}
                            </div>
                        </div>

                        {/* Unassigned */}
                        <div className="team-column unassigned-column">
                            {unassignedPlayers.map((p) => (
                                <div key={p.id} className="unassigned-player">
                                    <button className="assign-btn assign-a" onClick={() => assignToTeamA(p)}>←</button>
                                    <span>{p.name}</span>
                                    <button className="assign-btn assign-b" onClick={() => assignToTeamB(p)}>→</button>
                                </div>
                            ))}
                        </div>

                        {/* Team B */}
                        <div className="team-column">
                            <h4 className="team-header team-b-header">{t('setup.teamB')}</h4>
                            <div className="team-player-list">
                                {teamB.map((p) => (
                                    <div key={p.id} className="team-player team-b-player">{p.name}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* First Server */}
            {canStart && selectedPreset.config.mode !== 'general' && (
                <section className="setup-section">
                    <label className="setup-label">{t('setup.server')}</label>
                    <div className="server-selector">
                        <button
                            className={`btn ${initialServer === 0 ? 'btn-primary' : 'btn-secondary'} server-btn`}
                            onClick={() => setInitialServer(0)}
                        >
                            {teamA.map((p) => p.name).join(' & ')}
                        </button>
                        <button
                            className={`btn ${initialServer === 1 ? 'btn-primary' : 'btn-secondary'} server-btn`}
                            onClick={() => setInitialServer(1)}
                        >
                            {teamB.map((p) => p.name).join(' & ')}
                        </button>
                    </div>
                </section>
            )}

            {/* Start Button */}
            <button
                className="btn btn-primary btn-lg btn-full start-match-btn"
                disabled={!canStart}
                onClick={handleStart}
            >
                {t('setup.startMatch')}
            </button>

            {!canStart && players.length > 0 && (
                <p className="text-warning" style={{ textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
                    {t('setup.needPlayers')}
                </p>
            )}
        </div>
    );
}
