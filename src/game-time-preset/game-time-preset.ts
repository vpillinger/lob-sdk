const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

/** Game time preset IDs — config is the source of truth in @common/game-time-presets */
export type GameTimePresetId =
  | "bullet"
  | "blitz"
  | "rapid"
  | "daily"
  | "correspondence"
  | "marathon"
  | "offline"
  | "custom";

/**
 * Classifies game time controls by typical pace.
 * @see getGameSpeed
 */
export enum GameSpeed {
  /** Short time controls (e.g. bank or turn cap under 1 day). */
  Fast = "fast",
  /** Long time controls (e.g. daily, correspondence; bank or turn cap ≥ 1 day). */
  Slow = "slow",
}

/**
 * Derives the game speed from a set of timing values.
 * A game is **slow** when bankTimeSeconds >= 1 day OR turnCapSeconds >= 1 day.
 * Otherwise it is **fast**.
 */
export const getGameSpeed = (settings: CustomGameTimeSettings): GameSpeed =>
  settings.bankTimeSeconds >= SECONDS_PER_DAY ||
  settings.turnCapSeconds >= SECONDS_PER_DAY
    ? GameSpeed.Slow
    : GameSpeed.Fast;

/**
 * Four raw Fischer timing values that fully describe a game's time controls.
 * This is the canonical representation stored in the DB and used in game settings.
 */
export interface CustomGameTimeSettings {
  /** Starting bank per player; also the maximum the bank can reach after increments. */
  bankTimeSeconds: number;
  /** Seconds added to the bank after each submitted turn. 0 = no increment. */
  incrementSeconds: number;
  /** Per-turn wall-clock cap. 0 = no cap (daily presets). */
  turnCapSeconds: number;
  /**
   * Optional turn cap for the deployment turn (turn 0). If defined,
   * Fischer timing is bypassed for that turn. 0 = not set.
   */
  deploymentTimeSeconds: number;
}

export const OFFLINE_TIME_SETTINGS: CustomGameTimeSettings = {
  bankTimeSeconds: Number.MAX_SAFE_INTEGER,
  incrementSeconds: 0,
  turnCapSeconds: 0,
  deploymentTimeSeconds: 0,
};

/**
 * Game time presets use a Fischer timing system with three control parameters:
 *
 *  - **bankTimeSeconds** – each player's time bank. Players start with this much
 *    time and it also acts as the bank ceiling (increments cannot push the bank
 *    above this value).
 *
 *  - **incrementSeconds** – seconds added to a player's bank after they submit
 *    their turn. `0` means no increment (pure time-bank mode).
 *
 *  - **turnCapSeconds** – a per-turn wall-clock ceiling for fast games, preventing
 *    a player with a large bank from taking an extremely long single turn.
 *    `0` means no cap (used by daily/correspondence presets).
 */
export interface GameTimePreset extends CustomGameTimeSettings {
  id: GameTimePresetId;
  /** Whether the preset is intended for offline use only (e.g. replays) and should be hidden from selection menus. */
  isOffline?: boolean;
}

/**
 * Synthesizes a GameTimePreset from a CustomGameTimeSettings.
 * Used when a game was created with custom values rather than a named preset.
 */
export const customTimeSettingsToPreset = (
  s: CustomGameTimeSettings,
  id: GameTimePresetId = "custom"
): GameTimePreset => ({
  id,
  ...s,
});

export class GameTimePresetManager {
  private static _instance: GameTimePresetManager | null = null;
  private _presets: Map<GameTimePresetId, GameTimePreset> = new Map();

  public static readonly DEFAULT_PRESET_ID: GameTimePresetId = "blitz";
  public static readonly DEFAULT_FAST_PRESET_IDS: GameTimePresetId[] = ["bullet"];
  public static readonly DEFAULT_SLOW_PRESET_IDS: GameTimePresetId[] = ["daily"];
  /** Preset ID for offline/replay use (no time limit); hidden from selection. */
  public static readonly OFFLINE_PRESET_ID: GameTimePresetId = "offline";
  /** Preset ID used when game was created with custom time values (not a named preset). */
  public static readonly CUSTOM_PRESET_ID: GameTimePresetId = "custom";
  /** Preset IDs that are not shown in time-preset selection (e.g. create custom game). */
  public static readonly HIDDEN_FROM_SELECTION_IDS: readonly GameTimePresetId[] = [
    GameTimePresetManager.OFFLINE_PRESET_ID,
    GameTimePresetManager.CUSTOM_PRESET_ID,
  ];

  private constructor() {
    const presets: GameTimePreset[] = [
      {
        id: "bullet",
        bankTimeSeconds: 180, // 3 min
        incrementSeconds: 45,
        turnCapSeconds: 90, // 1:30 min
        deploymentTimeSeconds: 0,
      },
      {
        id: "blitz",
        bankTimeSeconds: 300, // 5 min
        incrementSeconds: 90,
        turnCapSeconds: 180, // 3 min
        deploymentTimeSeconds: 0,
      },
      {
        id: "rapid",
        bankTimeSeconds: 360, // 6 min
        incrementSeconds: 150,
        turnCapSeconds: 240, // 4 min
        deploymentTimeSeconds: 0,
      },

      {
        id: "daily",
        bankTimeSeconds: 86400, // 1 day
        incrementSeconds: 14400, // 4 h
        turnCapSeconds: 0,
        deploymentTimeSeconds: 0,
      },
      {
        id: "correspondence",
        bankTimeSeconds: 259200, // 3 days
        incrementSeconds: 43200, // 12 h
        turnCapSeconds: 0,
        deploymentTimeSeconds: 0,
      },
      {
        id: "marathon",
        bankTimeSeconds: 604800, // 7 days
        incrementSeconds: 86400, // 1 day
        turnCapSeconds: 0,
        deploymentTimeSeconds: 0,
      },
      {
        id: GameTimePresetManager.OFFLINE_PRESET_ID,
        bankTimeSeconds: Number.MAX_SAFE_INTEGER,
        incrementSeconds: 0,
        turnCapSeconds: 0,
        deploymentTimeSeconds: 0,
        isOffline: true,
      },
    ];

    presets.forEach((p) => this._presets.set(p.id, p));
  }

  public static getInstance(): GameTimePresetManager {
    if (!this._instance) {
      this._instance = new GameTimePresetManager();
    }
    return this._instance;
  }

  public get(id: GameTimePresetId): GameTimePreset {
    return this._presets.get(id)!;
  }

  public tryGet(id: GameTimePresetId): GameTimePreset | null {
    return this._presets.get(id) ?? null;
  }

  public getPresetIds(): GameTimePresetId[] {
    return Array.from(this._presets.keys());
  }

  /** Preset IDs that are available in time-preset selection (excludes offline, custom, etc.). */
  public getSelectablePresetIds(): GameTimePresetId[] {
    return this.getPresetIds().filter(
      (id) => !GameTimePresetManager.HIDDEN_FROM_SELECTION_IDS.includes(id)
    );
  }

  public getFastPresets(): GameTimePresetId[] {
    const result: GameTimePresetId[] = [];
    for (const [id, preset] of this._presets.entries()) {
      if (getGameSpeed(preset) === GameSpeed.Fast && !preset.isOffline) {
        result.push(id);
      }
    }
    return result;
  }

  public getSlowPresets(): GameTimePresetId[] {
    const result: GameTimePresetId[] = [];
    for (const [id, preset] of this._presets.entries()) {
      if (getGameSpeed(preset) === GameSpeed.Slow && !preset.isOffline) {
        result.push(id);
      }
    }
    return result;
  }

  /**
   * Returns the per-turn hard limit in seconds for a preset.
   */
  public getPresetTurnDurationSeconds(id: GameTimePresetId): number {
    const preset = this.get(id);
    return preset.turnCapSeconds || preset.bankTimeSeconds;
  }

  public calculateTimeRemaining(
    id: GameTimePresetId | null | undefined,
    turnStartedTime: number | null | undefined,
    nowSeconds: number
  ): number {
    if (!id || turnStartedTime === null || turnStartedTime === undefined) {
      return Infinity;
    }

    try {
      const limit = this.getPresetTurnDurationSeconds(id);
      return turnStartedTime + limit - nowSeconds;
    } catch (e) {
      return Infinity;
    }
  }

  public isRancid(
    id: GameTimePresetId | null | undefined,
    turnStartedTime: number | null | undefined,
    nowSeconds: number,
    marginSeconds: number
  ): boolean {
    if (!id || turnStartedTime === null || turnStartedTime === undefined) {
      return false;
    }

    try {
      const limit = this.getPresetTurnDurationSeconds(id);
      return turnStartedTime + limit + marginSeconds < nowSeconds;
    } catch (e) {
      return false;
    }
  }

  public orderActiveGames<
    T extends { passed: boolean; started: boolean; timeRemaining: number }
  >(games: T[]): T[] {
    return games.sort((a, b) => {
      if (a.passed !== b.passed) return a.passed ? 1 : -1;
      if (a.started !== b.started) return a.started ? -1 : 1;
      return a.timeRemaining - b.timeRemaining;
    });
  }
}


/** Converts seconds to a compact, human-readable label for preset cards. */
export const formatPresetTime = (seconds: number): string => {
  if (seconds % SECONDS_PER_DAY === 0) {
    const days = seconds / SECONDS_PER_DAY;
    return days === 1 ? "1 day" : `${days} days`;
  }
  if (seconds % SECONDS_PER_HOUR === 0) {
    const hours = seconds / SECONDS_PER_HOUR;
    return `${hours}h`;
  }
  if (seconds % SECONDS_PER_MINUTE === 0) {
    return `${seconds / SECONDS_PER_MINUTE} min`;
  }
  return `${seconds}s`;
};
