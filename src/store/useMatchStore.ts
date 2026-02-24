import { create } from 'zustand';
import type { MatchState, ScoringConfig, Team, PresetId } from '../types';
import {
    addPoint,
    subtractPoint,
    changeServer,
    endGameEarly,
    endSetEarly,
    endMatchEarly,
    createInitialGame,
    createInitialSet,
} from '../engine/scoringEngine';

const STORAGE_KEY = 'padelpulse-active-match';

interface MatchStore {
    match: MatchState | null;
    undoStack: MatchState[];
    maxUndo: number;

    // Actions
    createMatch: (params: {
        name: string;
        teams: [Team, Team];
        config: ScoringConfig;
        presetId: PresetId;
        initialServer: 0 | 1;
    }) => void;
    scorePoint: (teamIndex: 0 | 1) => void;
    removePoint: (teamIndex: 0 | 1) => void;
    undoLastPoint: () => void;
    toggleServer: () => void;
    forceEndGame: (teamIndex: 0 | 1) => void;
    forceEndSet: (teamIndex: 0 | 1) => void;
    forceEndMatch: (teamIndex: 0 | 1) => void;
    clearMatch: () => void;
    // Immediate Scoreboard Actions
    initQuickMatch: (mode?: 'general' | 'standard') => void;
    switchScoringMode: (mode: 'general' | 'standard') => void;
    updateTeam: (teamIndex: 0 | 1, name: string, color?: string) => void;
    swapTeams: () => void;
    resetCurrentMatch: () => void;

    loadFromStorage: () => void;
}

function saveToStorage(match: MatchState | null) {
    if (match) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const useMatchStore = create<MatchStore>((set, get) => ({
    match: null,
    undoStack: [],
    maxUndo: 3,

    createMatch: ({ name, teams, config, presetId, initialServer }) => {
        const match: MatchState = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            name,
            teams,
            config,
            presetId,
            sets: [createInitialSet()],
            currentSetIndex: 0,
            currentGame: createInitialGame(initialServer),
            status: 'inProgress',
            setsWonA: 0,
            setsWonB: 0,
            winner: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
            initialServer,
        };
        saveToStorage(match);
        set({ match, undoStack: [] });
    },

    scorePoint: (teamIndex) => {
        const { match, undoStack, maxUndo } = get();
        if (!match) return;

        const newStack = [...undoStack, JSON.parse(JSON.stringify(match))].slice(-maxUndo);
        const newMatch = addPoint(match, teamIndex);

        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: newStack });
    },

    removePoint: (teamIndex) => {
        const { match, undoStack, maxUndo } = get();
        if (!match) return;

        const newStack = [...undoStack, JSON.parse(JSON.stringify(match))].slice(-maxUndo);
        const newMatch = subtractPoint(match, teamIndex);

        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: newStack });
    },

    undoLastPoint: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return;

        const newStack = [...undoStack];
        const prevMatch = newStack.pop()!;

        saveToStorage(prevMatch);
        set({ match: prevMatch, undoStack: newStack });
    },

    toggleServer: () => {
        const { match } = get();
        if (!match) return;
        const newMatch = changeServer(match);
        saveToStorage(newMatch);
        set({ match: newMatch });
    },

    forceEndGame: (teamIndex) => {
        const { match, undoStack, maxUndo } = get();
        if (!match) return;
        const newStack = [...undoStack, JSON.parse(JSON.stringify(match))].slice(-maxUndo);
        const newMatch = endGameEarly(match, teamIndex);
        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: newStack });
    },

    forceEndSet: (teamIndex) => {
        const { match, undoStack, maxUndo } = get();
        if (!match) return;
        const newStack = [...undoStack, JSON.parse(JSON.stringify(match))].slice(-maxUndo);
        const newMatch = endSetEarly(match, teamIndex);
        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: newStack });
    },

    forceEndMatch: (teamIndex) => {
        const { match, undoStack, maxUndo } = get();
        if (!match) return;
        const newStack = [...undoStack, JSON.parse(JSON.stringify(match))].slice(-maxUndo);
        const newMatch = endMatchEarly(match, teamIndex);
        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: newStack });
    },

    clearMatch: () => {
        saveToStorage(null);
        set({ match: null, undoStack: [] });
    },

    // --- Immediate Scoreboard Actions ---

    initQuickMatch: (mode = 'general' as 'general' | 'standard') => {
        const { match } = get();
        if (match) return; // Do not overwrite an existing active match

        const quickConfig: ScoringConfig = mode === 'standard'
            ? {
                mode: 'standard',
                gamesPerSet: 6,
                setsToWin: 1,
                tieBreakAt: 6,
                tieBreakPoints: 7,
                useMatchTieBreak: false,
                matchTieBreakPoints: 10,
                rallyTarget: 21,
                rallyWinByTwo: true
            }
            : {
                mode: 'general',
                gamesPerSet: 6,
                setsToWin: 1,
                tieBreakAt: 6,
                tieBreakPoints: 7,
                useMatchTieBreak: false,
                matchTieBreakPoints: 10,
                rallyTarget: 21,
                rallyWinByTwo: true
            };

        const newMatch: MatchState = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            name: mode === 'standard' ? 'Tennis Match' : 'Quick Match',
            teams: [
                { id: 'team-a', players: [{ id: 'p1', name: 'Player 1' }], name: 'HOME', color: '#55E0B4' },
                { id: 'team-b', players: [{ id: 'p2', name: 'Player 2' }], name: 'AWAY', color: '#FF5C5C' }
            ],
            config: quickConfig,
            presetId: 'official',
            sets: [createInitialSet()],
            currentSetIndex: 0,
            currentGame: createInitialGame(0),
            status: 'inProgress',
            setsWonA: 0,
            setsWonB: 0,
            winner: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
            initialServer: 0,
        };

        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: [] });
    },

    switchScoringMode: (mode) => {
        const { match } = get();
        // Preserve team names and colors across mode switches
        const teams = match ? [...match.teams] as [Team, Team] : [
            { id: 'team-a', players: [{ id: 'p1', name: 'Player 1' }], name: 'HOME', color: '#55E0B4' },
            { id: 'team-b', players: [{ id: 'p2', name: 'Player 2' }], name: 'AWAY', color: '#FF5C5C' }
        ] as [Team, Team];

        const config: ScoringConfig = mode === 'standard'
            ? {
                mode: 'standard',
                gamesPerSet: 6,
                setsToWin: 1,
                tieBreakAt: 6,
                tieBreakPoints: 7,
                useMatchTieBreak: false,
                matchTieBreakPoints: 10,
                rallyTarget: 21,
                rallyWinByTwo: true
            }
            : {
                mode: 'general',
                gamesPerSet: 6,
                setsToWin: 1,
                tieBreakAt: 6,
                tieBreakPoints: 7,
                useMatchTieBreak: false,
                matchTieBreakPoints: 10,
                rallyTarget: 21,
                rallyWinByTwo: true
            };

        const newMatch: MatchState = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
            name: mode === 'standard' ? 'Tennis Match' : 'Quick Match',
            teams,
            config,
            presetId: 'official',
            sets: [createInitialSet()],
            currentSetIndex: 0,
            currentGame: createInitialGame(0),
            status: 'inProgress',
            setsWonA: 0,
            setsWonB: 0,
            winner: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
            initialServer: 0,
        };

        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: [] });
    },

    updateTeam: (teamIndex, name, color) => {
        const { match } = get();
        if (!match) return;

        const newMatch = JSON.parse(JSON.stringify(match)) as MatchState;
        newMatch.teams[teamIndex].name = name;
        if (color !== undefined) {
            newMatch.teams[teamIndex].color = color;
        }

        // Add to undo stack so we can undo name changes if we really want, but usually it's best to clear undo stack to avoid weird state branching on meta data, or just not put it in undo stack. We'll skip undo stack for team name changes.
        saveToStorage(newMatch);
        set({ match: newMatch });
    },

    swapTeams: () => {
        const { match, undoStack, maxUndo } = get();
        if (!match) return;

        // Swapping is tricky if we want to reverse scores too. 
        // For physical court swapping sides, we usually want to swap names & colors, and scores so "left side is left side".
        // A generic swap reverses the teams completely.
        const newStack = [...undoStack, JSON.parse(JSON.stringify(match))].slice(-maxUndo);
        const newMatch = JSON.parse(JSON.stringify(match)) as MatchState;

        // Swap teams array
        const tempTeam = newMatch.teams[0];
        newMatch.teams[0] = newMatch.teams[1];
        newMatch.teams[1] = tempTeam;

        // Swap sets score
        newMatch.sets.forEach(set => {
            const tempGames = set.gamesA;
            set.gamesA = set.gamesB;
            set.gamesB = tempGames;

            // Swap games history in set if needed
            set.games.forEach(game => {
                const tempPts = game.pointsA;
                game.pointsA = game.pointsB;
                game.pointsB = tempPts;

                if (game.advantage === 'teamA') game.advantage = 'teamB';
                else if (game.advantage === 'teamB') game.advantage = 'teamA';

                game.server = game.server === 0 ? 1 : 0;
            });
        });

        // Swap current game score
        const tempPts = newMatch.currentGame.pointsA;
        newMatch.currentGame.pointsA = newMatch.currentGame.pointsB;
        newMatch.currentGame.pointsB = tempPts;

        if (newMatch.currentGame.advantage === 'teamA') newMatch.currentGame.advantage = 'teamB';
        else if (newMatch.currentGame.advantage === 'teamB') newMatch.currentGame.advantage = 'teamA';

        newMatch.currentGame.server = newMatch.currentGame.server === 0 ? 1 : 0;
        newMatch.initialServer = newMatch.initialServer === 0 ? 1 : 0;

        // Swap sets won
        const tempSetsWon = newMatch.setsWonA;
        newMatch.setsWonA = newMatch.setsWonB;
        newMatch.setsWonB = tempSetsWon;

        // Swap winner if match is completed
        if (newMatch.winner === 0) newMatch.winner = 1;
        else if (newMatch.winner === 1) newMatch.winner = 0;

        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: newStack });
    },

    resetCurrentMatch: () => {
        const { match, undoStack, maxUndo } = get();
        if (!match) return;

        const newStack = [...undoStack, JSON.parse(JSON.stringify(match))].slice(-maxUndo);
        const newMatch = JSON.parse(JSON.stringify(match)) as MatchState;

        // Reset scores but keep team names, config, etc.
        newMatch.sets = [createInitialSet()];
        newMatch.currentSetIndex = 0;
        newMatch.currentGame = createInitialGame(newMatch.initialServer);
        newMatch.status = 'inProgress';
        newMatch.setsWonA = 0;
        newMatch.setsWonB = 0;
        newMatch.winner = null;
        newMatch.createdAt = new Date().toISOString();
        newMatch.completedAt = null;

        saveToStorage(newMatch);
        set({ match: newMatch, undoStack: newStack });
    },

    loadFromStorage: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const match = JSON.parse(raw) as MatchState;
                set({ match });
            }
        } catch {
            // Ignore corrupted storage
        }
    },
}));
