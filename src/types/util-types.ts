export enum Size {
  XSmall = "xs",
  Small = "s",
  Medium = "m",
  Large = "l",
  ExtraLarge = "xl",
}

/** Game time preset IDs — config is the source of truth in @common/game-time-presets */
export type GameTimePresetId =
  | "blitz"
  | "rapid"
  | "strategic"
  | "active"
  | "standard"
  | "epic";

export const GAME_TIME_PRESET_IDS: readonly GameTimePresetId[] = [
  "blitz",
  "rapid",
  "strategic",
  "active",
  "standard",
  "epic",
];

/** Convenience constants for game time preset IDs (avoids enum) */
export const GameTimePreset = {
  Blitz: "blitz",
  Rapid: "rapid",
  Strategic: "strategic",
  Active: "active",
  Standard: "standard",
  Epic: "epic",
} as const satisfies Record<string, GameTimePresetId>;

export enum TeamSize {
  OneVsOne = "1v1",
  TwoVsTwo = "2v2",
}
