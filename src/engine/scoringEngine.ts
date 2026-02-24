import type { MatchState, GameState, SetState, ScoringConfig } from '../types';

/**
 * PadelPulse Scoring Engine
 *
 * Pure functions that take a MatchState and return a new MatchState.
 * Supports: standard padel, golden point, rally, and general scoring.
 */

// ─── Helpers ────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

const STANDARD_POINTS = [0, 15, 30, 40] as const;

function nextStandardPoint(current: number): number {
    const idx = STANDARD_POINTS.indexOf(current as 0 | 15 | 30 | 40);
    if (idx === -1 || idx >= STANDARD_POINTS.length - 1) return current;
    return STANDARD_POINTS[idx + 1];
}

export function createInitialGame(server: 0 | 1, isTieBreak = false, isMatchTieBreak = false): GameState {
    return {
        pointsA: 0,
        pointsB: 0,
        advantage: 'none',
        isTieBreak,
        isMatchTieBreak,
        server,
        serveSide: 'right',
    };
}

export function createInitialSet(): SetState {
    return {
        gamesA: 0,
        gamesB: 0,
        games: [],
    };
}

// ─── Main Scoring Function ──────────────────────────────────────────

/**
 * Add a point for a team (0 = Team A, 1 = Team B).
 * Returns a new MatchState (immutable).
 */
export function addPoint(state: MatchState, teamIndex: 0 | 1): MatchState {
    if (state.status !== 'inProgress') return state;

    const config = state.config;

    switch (config.mode) {
        case 'standard':
        case 'goldenPoint':
            return addStandardPoint(state, teamIndex);
        case 'rally':
            return addRallyPoint(state, teamIndex);
        case 'general':
            return addGeneralPoint(state, teamIndex);
        default:
            return state;
    }
}

export function subtractPoint(state: MatchState, teamIndex: 0 | 1): MatchState {
    if (state.status !== 'inProgress') return state;

    const next = deepClone(state);
    const mode = next.config.mode;

    if (mode === 'general' || mode === 'rally') {
        if (teamIndex === 0) {
            next.currentGame.pointsA = Math.max(0, next.currentGame.pointsA - 1);
        } else {
            next.currentGame.pointsB = Math.max(0, next.currentGame.pointsB - 1);
        }
        return next;
    }

    if (mode === 'standard' || mode === 'goldenPoint') {
        const game = next.currentGame;

        if (game.isTieBreak || game.isMatchTieBreak) {
            if (teamIndex === 0) {
                game.pointsA = Math.max(0, game.pointsA - 1);
            } else {
                game.pointsB = Math.max(0, game.pointsB - 1);
            }
            return next;
        }

        // Handle advantage cases
        if (game.advantage === 'teamA' && teamIndex === 0) {
            game.advantage = 'none';
            return next;
        }
        if (game.advantage === 'teamB' && teamIndex === 1) {
            game.advantage = 'none';
            return next;
        }

        // Cannot subtract from opponent's advantage via your own minus button, usually just minus your own points
        const currentPts = teamIndex === 0 ? game.pointsA : game.pointsB;
        let newPts = currentPts;

        if (currentPts === 40) newPts = 30;
        else if (currentPts === 30) newPts = 15;
        else if (currentPts === 15) newPts = 0;

        if (teamIndex === 0) game.pointsA = newPts;
        else game.pointsB = newPts;

        return next;
    }

    return next;
}

// ─── Standard / Golden Point Scoring ────────────────────────────────

function addStandardPoint(state: MatchState, teamIndex: 0 | 1): MatchState {
    const next = deepClone(state);
    const game = next.currentGame;
    const config = next.config;

    // Tie-break scoring
    if (game.isTieBreak || game.isMatchTieBreak) {
        return addTieBreakPoint(next, teamIndex);
    }

    const isGolden = config.mode === 'goldenPoint';

    // Both at 40 (deuce situation)
    if (game.pointsA === 40 && game.pointsB === 40) {
        if (isGolden) {
            // Golden point: no advantage, next point wins
            return winGame(next, teamIndex);
        }

        // Standard advantage logic
        if (game.advantage === 'none') {
            game.advantage = teamIndex === 0 ? 'teamA' : 'teamB';
            return next;
        }

        const advTeam = game.advantage === 'teamA' ? 0 : 1;

        if (advTeam === teamIndex) {
            // Advantage team wins the game
            return winGame(next, teamIndex);
        } else {
            // Back to deuce
            game.advantage = 'none';
            return next;
        }
    }

    // Normal point progression
    if (teamIndex === 0) {
        if (game.pointsA === 40) {
            // Team A wins the game
            return winGame(next, teamIndex);
        }
        game.pointsA = nextStandardPoint(game.pointsA);
    } else {
        if (game.pointsB === 40) {
            return winGame(next, teamIndex);
        }
        game.pointsB = nextStandardPoint(game.pointsB);
    }

    return next;
}

// ─── Tie-Break Scoring ──────────────────────────────────────────────

function addTieBreakPoint(state: MatchState, teamIndex: 0 | 1): MatchState {
    const game = state.currentGame;
    const target = game.isMatchTieBreak
        ? state.config.matchTieBreakPoints
        : state.config.tieBreakPoints;

    if (teamIndex === 0) {
        game.pointsA += 1;
    } else {
        game.pointsB += 1;
    }

    // Check win: reach target AND win by 2
    const a = game.pointsA;
    const b = game.pointsB;
    if ((a >= target || b >= target) && Math.abs(a - b) >= 2) {
        const winner = a > b ? 0 : 1;
        if (game.isMatchTieBreak) {
            // Match tie-break wins the match
            return winSet(state, winner);
        }
        return winGame(state, winner);
    }

    // Server changes every 2 points in tie-break (after first point, then every 2)
    const totalPoints = game.pointsA + game.pointsB;
    if (totalPoints === 1 || (totalPoints > 1 && (totalPoints - 1) % 2 === 0)) {
        game.server = game.server === 0 ? 1 : 0;
    }

    // Serve side alternates each point
    game.serveSide = totalPoints % 2 === 0 ? 'right' : 'left';

    return state;
}

// ─── Rally Scoring ──────────────────────────────────────────────────

function addRallyPoint(state: MatchState, teamIndex: 0 | 1): MatchState {
    const next = deepClone(state);
    const game = next.currentGame;
    const config = next.config;

    if (teamIndex === 0) {
        game.pointsA += 1;
    } else {
        game.pointsB += 1;
    }

    const a = game.pointsA;
    const b = game.pointsB;
    const target = config.rallyTarget;
    const winByTwo = config.rallyWinByTwo;

    if (a >= target || b >= target) {
        if (!winByTwo || Math.abs(a - b) >= 2) {
            const winner = a > b ? 0 : 1;
            return completeMatch(next, winner);
        }
    }

    return next;
}

// ─── General Scoring (Free Counter) ─────────────────────────────────

function addGeneralPoint(state: MatchState, teamIndex: 0 | 1): MatchState {
    const next = deepClone(state);
    if (teamIndex === 0) {
        next.currentGame.pointsA += 1;
    } else {
        next.currentGame.pointsB += 1;
    }
    return next;
}

// ─── Game / Set / Match Progression ─────────────────────────────────

function winGame(state: MatchState, teamIndex: 0 | 1): MatchState {
    const set = state.sets[state.currentSetIndex];
    const config = state.config;

    // Record game in set history
    set.games.push({ ...state.currentGame });

    if (teamIndex === 0) {
        set.gamesA += 1;
    } else {
        set.gamesB += 1;
    }

    // Check if set is won
    const a = set.gamesA;
    const b = set.gamesB;

    // Win by reaching gamesPerSet with a 2-game lead
    if (a >= config.gamesPerSet && a - b >= 2) {
        return winSet(state, 0);
    }
    if (b >= config.gamesPerSet && b - a >= 2) {
        return winSet(state, 1);
    }

    // Tie-break trigger
    if (a === config.tieBreakAt && b === config.tieBreakAt) {
        // Check if this is the final set and we should use match tie-break
        const isLastPossibleSet =
            config.useMatchTieBreak &&
            state.setsWonA === config.setsToWin - 1 &&
            state.setsWonB === config.setsToWin - 1;

        const newServer: 0 | 1 = state.currentGame.server === 0 ? 1 : 0;
        state.currentGame = createInitialGame(
            newServer,
            !isLastPossibleSet,   // regular tiebreak
            isLastPossibleSet     // match tiebreak
        );
        return state;
    }

    // Next game – server alternates
    const newServer: 0 | 1 = state.currentGame.server === 0 ? 1 : 0;
    state.currentGame = createInitialGame(newServer);
    return state;
}

function winSet(state: MatchState, teamIndex: 0 | 1): MatchState {
    if (teamIndex === 0) {
        state.setsWonA += 1;
    } else {
        state.setsWonB += 1;
    }

    // Check if match is won
    if (state.setsWonA >= state.config.setsToWin) {
        return completeMatch(state, 0);
    }
    if (state.setsWonB >= state.config.setsToWin) {
        return completeMatch(state, 1);
    }

    // Start new set
    state.currentSetIndex += 1;
    state.sets.push(createInitialSet());
    const newServer: 0 | 1 = state.currentGame.server === 0 ? 1 : 0;
    state.currentGame = createInitialGame(newServer);
    return state;
}

function completeMatch(state: MatchState, winner: 0 | 1): MatchState {
    state.status = 'completed';
    state.winner = winner;
    state.completedAt = new Date().toISOString();

    // Store the final game in the current set
    state.sets[state.currentSetIndex].games.push({ ...state.currentGame });

    return state;
}

// ─── Manual Overrides ───────────────────────────────────────────────

/**
 * Manually end the current game, awarding it to teamIndex.
 */
export function endGameEarly(state: MatchState, teamIndex: 0 | 1): MatchState {
    if (state.status !== 'inProgress') return state;
    const next = deepClone(state);
    return winGame(next, teamIndex);
}

/**
 * Manually end the current set, awarding it to teamIndex.
 */
export function endSetEarly(state: MatchState, teamIndex: 0 | 1): MatchState {
    if (state.status !== 'inProgress') return state;
    const next = deepClone(state);
    return winSet(next, teamIndex);
}

/**
 * Manually end the match, awarding it to teamIndex.
 */
export function endMatchEarly(state: MatchState, teamIndex: 0 | 1): MatchState {
    if (state.status !== 'inProgress') return state;
    const next = deepClone(state);
    return completeMatch(next, teamIndex);
}

/**
 * Change the server manually.
 */
export function changeServer(state: MatchState): MatchState {
    const next = deepClone(state);
    next.currentGame.server = next.currentGame.server === 0 ? 1 : 0;
    return next;
}

// ─── Score Display Helpers ──────────────────────────────────────────

/**
 * Get the display string for a standard point value.
 */
export function formatStandardPoint(
    points: number,
    opponentPoints: number,
    advantage: 'none' | 'teamA' | 'teamB',
    isTeamA: boolean
): string {
    if (points === 40 && opponentPoints === 40) {
        if (advantage === 'none') return '40';
        if ((advantage === 'teamA' && isTeamA) || (advantage === 'teamB' && !isTeamA)) {
            return 'AD';
        }
        return '40';
    }
    return String(points);
}

/**
 * Determine if it's a match point, set point, game point, or break point situation.
 */
export function getPointSituation(state: MatchState): string | null {
    if (state.status !== 'inProgress') return null;

    const config = state.config;
    if (config.mode === 'general') return null;

    const game = state.currentGame;
    const set = state.sets[state.currentSetIndex];

    if (config.mode === 'rally') {
        const target = config.rallyTarget;
        const a = game.pointsA;
        const b = game.pointsB;
        if (a >= target - 1 && a > b) return 'matchPoint';
        if (b >= target - 1 && b > a) return 'matchPoint';
        return null;
    }

    // Standard / Golden Point modes
    // Check if someone is about to win a game
    const isAAboutToWinGame = isAboutToWinGame(game, 0, config);
    const isBAboutToWinGame = isAboutToWinGame(game, 1, config);

    if (!isAAboutToWinGame && !isBAboutToWinGame) return null;

    const winningTeam = isAAboutToWinGame ? 0 : 1;

    // Check if winning this game would win the set
    const gamesA = set.gamesA + (winningTeam === 0 ? 1 : 0);
    const gamesB = set.gamesB + (winningTeam === 1 ? 1 : 0);
    const wouldWinSet =
        (gamesA >= config.gamesPerSet && gamesA - gamesB >= 2) ||
        game.isTieBreak || game.isMatchTieBreak;

    if (wouldWinSet) {
        // Check if winning this set would win the match
        const setsWon = (winningTeam === 0 ? state.setsWonA : state.setsWonB) + 1;
        if (setsWon >= config.setsToWin || game.isMatchTieBreak) {
            return 'matchPoint';
        }
        return 'setPoint';
    }

    // Is it a break point? (non-serving team about to win game)
    if (winningTeam !== game.server && !game.isTieBreak && !game.isMatchTieBreak) {
        return 'breakPoint';
    }

    return 'gamePoint';
}

function isAboutToWinGame(game: GameState, team: 0 | 1, config: ScoringConfig): boolean {
    if (game.isTieBreak || game.isMatchTieBreak) {
        const target = game.isMatchTieBreak ? config.matchTieBreakPoints : config.tieBreakPoints;
        const pts = team === 0 ? game.pointsA : game.pointsB;
        const oppPts = team === 0 ? game.pointsB : game.pointsA;
        return pts >= target - 1 && pts >= oppPts;
    }

    const pts = team === 0 ? game.pointsA : game.pointsB;
    const oppPts = team === 0 ? game.pointsB : game.pointsA;
    const adv = game.advantage;
    const teamAdv = team === 0 ? 'teamA' : 'teamB';

    // At 40 and opponent is below 40, next point wins
    if (pts === 40 && oppPts < 40) return true;
    // Has advantage
    if (pts === 40 && oppPts === 40 && adv === teamAdv) return true;

    return false;
}
