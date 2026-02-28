/** Game time preset IDs — config is the source of truth in @common/game-time-presets */
export type GameTimePresetId =
  | "blitz"
  | "rapid"
  | "strategic"
  | "active"
  | "standard"
  | "epic";

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
export interface GameTimePresetConfig {
  id: GameTimePresetId;
  gameSpeed: GameSpeed;
  /** Starting bank per player; also the maximum the bank can reach after increments. */
  bankTimeSeconds: number;
  /** Seconds added to the bank after each submitted turn. 0 = no increment. */
  incrementSeconds: number;
  /** Per-turn wall-clock cap. 0 = no cap (daily presets). */
  turnCapSeconds: number;
}

export class GameTimePresetManager {
  private static _instance: GameTimePresetManager | null = null;
  private _presets: Map<GameTimePresetId, GameTimePresetConfig> = new Map();

  private constructor() {
    const presets: GameTimePresetConfig[] = [
      {
        id: "blitz",
        gameSpeed: GameSpeed.Fast,
        bankTimeSeconds: 180, // 3 min
        incrementSeconds: 30,
        turnCapSeconds: 120, // 2 min
      },
      {
        id: "rapid",
        gameSpeed: GameSpeed.Fast,
        bankTimeSeconds: 600, // 10 min
        incrementSeconds: 60,
        turnCapSeconds: 300, // 5 min
      },
      {
        id: "strategic",
        gameSpeed: GameSpeed.Fast,
        bankTimeSeconds: 1800, // 30 min
        incrementSeconds: 120,
        turnCapSeconds: 900, // 15 min
      },

      {
        id: "active",
        gameSpeed: GameSpeed.Slow,
        bankTimeSeconds: 86400, // 1 day
        incrementSeconds: 14400, // 4 h
        turnCapSeconds: 0,
      },
      {
        id: "standard",
        gameSpeed: GameSpeed.Slow,
        bankTimeSeconds: 259200, // 3 days
        incrementSeconds: 43200, // 12 h
        turnCapSeconds: 0,
      },
      {
        id: "epic",
        gameSpeed: GameSpeed.Slow,
        bankTimeSeconds: 604800, // 7 days
        incrementSeconds: 86400, // 1 day
        turnCapSeconds: 0,
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

  public get(id: GameTimePresetId): GameTimePresetConfig {
    return this._presets.get(id)!;
  }

  public tryGet(id: GameTimePresetId): GameTimePresetConfig | null {
    return this._presets.get(id) ?? null;
  }

  public getPresetIds(): GameTimePresetId[] {
    return Array.from(this._presets.keys());
  }

  public getFastPresets(): GameTimePresetId[] {
    const result: GameTimePresetId[] = [];
    for (const [id, preset] of this._presets.entries()) {
      if (preset.gameSpeed === GameSpeed.Fast) {
        result.push(id);
      }
    }
    return result;
  }

  public getSlowPresets(): GameTimePresetId[] {
    const result: GameTimePresetId[] = [];
    for (const [id, preset] of this._presets.entries()) {
      if (preset.gameSpeed === GameSpeed.Slow) {
        result.push(id);
      }
    }
    return result;
  }
}

export enum GameSpeed {
  Fast = "fast",
  Slow = "slow",
}

/**
 * Returns the per-turn hard limit in seconds for a preset.
 * For fast presets this is turnCapSeconds; for slow presets (turnCapSeconds = 0, no cap) it falls
 * back to bankTimeSeconds so that DB turn_duration_limit stays meaningful.
 */
export const getPresetTurnDurationSeconds = (id: GameTimePresetId): number => {
  const preset = GameTimePresetManager.getInstance().get(id);
  return preset.turnCapSeconds || preset.bankTimeSeconds;
};

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

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
