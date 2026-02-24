import type { ScoringPreset, ScoringConfig } from '../types';

const defaultStandardConfig: ScoringConfig = {
    mode: 'standard',
    gamesPerSet: 6,
    setsToWin: 2,
    tieBreakAt: 6,
    tieBreakPoints: 7,
    useMatchTieBreak: false,
    matchTieBreakPoints: 10,
    rallyTarget: 21,
    rallyWinByTwo: true,
};

export const presets: ScoringPreset[] = [
    {
        id: 'official',
        nameKey: 'presets.official',
        descriptionKey: 'presets.officialDesc',
        config: { ...defaultStandardConfig },
    },
    {
        id: 'goldenPoint',
        nameKey: 'presets.goldenPoint',
        descriptionKey: 'presets.goldenPointDesc',
        config: { ...defaultStandardConfig, mode: 'goldenPoint' },
    },
    {
        id: 'fastSocial',
        nameKey: 'presets.fastSocial',
        descriptionKey: 'presets.fastSocialDesc',
        config: {
            ...defaultStandardConfig,
            gamesPerSet: 4,
            tieBreakAt: 4,
            setsToWin: 1,
        },
    },
    {
        id: 'tieBreakMatch',
        nameKey: 'presets.tieBreakMatch',
        descriptionKey: 'presets.tieBreakMatchDesc',
        config: {
            ...defaultStandardConfig,
            useMatchTieBreak: true,
            matchTieBreakPoints: 10,
        },
    },
    {
        id: 'rally21',
        nameKey: 'presets.rally21',
        descriptionKey: 'presets.rally21Desc',
        config: {
            ...defaultStandardConfig,
            mode: 'rally',
            rallyTarget: 21,
            rallyWinByTwo: true,
        },
    },
    {
        id: 'general',
        nameKey: 'presets.general',
        descriptionKey: 'presets.generalDesc',
        config: {
            ...defaultStandardConfig,
            mode: 'general',
        },
    },
    {
        id: 'custom',
        nameKey: 'presets.custom',
        descriptionKey: 'presets.customDesc',
        config: { ...defaultStandardConfig },
    },
];

export function getPresetById(id: string): ScoringPreset | undefined {
    return presets.find((p) => p.id === id);
}

export function getDefaultConfig(): ScoringConfig {
    return { ...defaultStandardConfig };
}
