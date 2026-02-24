/* ===========================
   PadelPulse – Core Types
   =========================== */

export interface Player {
  id: string;
  name: string;
  color?: string;
}

export interface Team {
  id: string;
  players: Player[];
  name: string;
  color?: string;
}

/* --- Scoring Configuration --- */

export type ScoringMode =
  | 'standard'     // 15-30-40, games, sets (classic padel/tennis)
  | 'goldenPoint'  // No-advantage: at 40-40, next point wins
  | 'rally'        // Linear points to target (e.g. first to 21)
  | 'general';     // Free counter: just +/- buttons, no auto-progression

export interface ScoringConfig {
  mode: ScoringMode;

  // Standard / Golden Point settings
  gamesPerSet: number;           // default 6
  setsToWin: number;             // default 2 (best of 3)
  tieBreakAt: number;            // default equals gamesPerSet (6-6 → tiebreak)
  tieBreakPoints: number;        // default 7
  useMatchTieBreak: boolean;     // If true, final set replaced by super tie-break
  matchTieBreakPoints: number;   // default 10

  // Rally settings
  rallyTarget: number;           // Points to win (e.g. 21)
  rallyWinByTwo: boolean;        // Must win by 2

  // General settings (no target, just free counting)
  // No specific config needed — just +/- increments
}

export type PresetId =
  | 'official'
  | 'goldenPoint'
  | 'fastSocial'
  | 'tieBreakMatch'
  | 'rally21'
  | 'general'
  | 'custom';

export interface ScoringPreset {
  id: PresetId;
  nameKey: string;         // i18n key
  descriptionKey: string;  // i18n key
  config: ScoringConfig;
}

/* --- Game State --- */

// Standard padel point values
export type StandardPoint = 0 | 15 | 30 | 40;
export type AdvantageState = 'none' | 'teamA' | 'teamB';

export interface GameState {
  pointsA: number;     // For standard: 0,15,30,40. For rally/general: numeric
  pointsB: number;
  advantage: AdvantageState;  // Only used in standard mode
  isTieBreak: boolean;
  isMatchTieBreak: boolean;
  server: 0 | 1;      // 0 = Team A serves, 1 = Team B serves
  serveSide: 'right' | 'left';
}

export interface SetState {
  gamesA: number;
  gamesB: number;
  games: GameState[];  // History of games in this set
}

export type MatchStatus = 'setup' | 'inProgress' | 'completed';

export interface MatchState {
  id: string;
  name: string;
  teams: [Team, Team];
  config: ScoringConfig;
  presetId: PresetId;
  sets: SetState[];
  currentSetIndex: number;
  currentGame: GameState;
  status: MatchStatus;
  setsWonA: number;
  setsWonB: number;
  winner: null | 0 | 1;
  createdAt: string;
  completedAt: string | null;
  initialServer: 0 | 1;
}

/* --- Match History --- */

export interface MatchSummary {
  id: string;
  name: string;
  teams: [Team, Team];
  presetId: PresetId;
  sets: { gamesA: number; gamesB: number }[];
  setsWonA: number;
  setsWonB: number;
  winner: 0 | 1 | null;
  totalGamesA: number;
  totalGamesB: number;
  createdAt: string;
  completedAt: string | null;
}

/* --- Settings --- */

export interface AppSettings {
  language: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}
