import { create } from 'zustand';
import type { AppSettings } from '../types';

const STORAGE_KEY = 'padelpulse-settings';

interface SettingsStore extends AppSettings {
    updateLanguage: (lang: string) => void;
    toggleSound: () => void;
    toggleHaptic: () => void;
    loadSettings: () => void;
}

function readSettings(): AppSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }
    return {
        language: 'en',
        soundEnabled: true,
        hapticEnabled: true,
    };
}

function writeSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    ...readSettings(),

    updateLanguage: (lang) => {
        set({ language: lang });
        localStorage.setItem('padelpulse-lang', lang);
        writeSettings({ ...get(), language: lang });
    },

    toggleSound: () => {
        const next = !get().soundEnabled;
        set({ soundEnabled: next });
        writeSettings({ ...get(), soundEnabled: next });
    },

    toggleHaptic: () => {
        const next = !get().hapticEnabled;
        set({ hapticEnabled: next });
        writeSettings({ ...get(), hapticEnabled: next });
    },

    loadSettings: () => {
        const settings = readSettings();
        set(settings);
    },
}));
