import { create } from 'zustand';
import type { MatchSummary, MatchState } from '../types';

const STORAGE_KEY = 'padelpulse-history';

interface HistoryStore {
    matches: MatchSummary[];
    loadHistory: () => void;
    saveMatch: (state: MatchState) => void;
    deleteMatch: (id: string) => void;
    getMatch: (id: string) => MatchSummary | undefined;
}

function readStorage(): MatchSummary[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeStorage(matches: MatchSummary[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export function matchStateToSummary(state: MatchState): MatchSummary {
    const totalGamesA = state.sets.reduce((sum, s) => sum + s.gamesA, 0);
    const totalGamesB = state.sets.reduce((sum, s) => sum + s.gamesB, 0);

    return {
        id: state.id,
        name: state.name,
        teams: state.teams,
        presetId: state.presetId,
        sets: state.sets.map((s) => ({ gamesA: s.gamesA, gamesB: s.gamesB })),
        setsWonA: state.setsWonA,
        setsWonB: state.setsWonB,
        winner: state.winner,
        totalGamesA,
        totalGamesB,
        createdAt: state.createdAt,
        completedAt: state.completedAt,
    };
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
    matches: [],

    loadHistory: () => {
        const matches = readStorage();
        set({ matches });
    },

    saveMatch: (state: MatchState) => {
        const summary = matchStateToSummary(state);
        const existing = get().matches;
        // Avoid duplicates
        const filtered = existing.filter((m) => m.id !== summary.id);
        const updated = [summary, ...filtered];
        writeStorage(updated);
        set({ matches: updated });
    },

    deleteMatch: (id: string) => {
        const updated = get().matches.filter((m) => m.id !== id);
        writeStorage(updated);
        set({ matches: updated });
    },

    getMatch: (id: string) => {
        return get().matches.find((m) => m.id === id);
    },
}));
