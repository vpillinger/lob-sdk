export declare enum Size {
    XSmall = "xs",
    Small = "s",
    Medium = "m",
    Large = "l",
    ExtraLarge = "xl"
}
/** Game time preset IDs — config is the source of truth in @common/game-time-presets */
export type GameTimePresetId = "blitz" | "rapid" | "strategic" | "active" | "standard" | "epic";
export declare const GAME_TIME_PRESET_IDS: readonly GameTimePresetId[];
/** Convenience constants for game time preset IDs (avoids enum) */
export declare const GameTimePreset: {
    readonly Blitz: "blitz";
    readonly Rapid: "rapid";
    readonly Strategic: "strategic";
    readonly Active: "active";
    readonly Standard: "standard";
    readonly Epic: "epic";
};
export declare enum TeamSize {
    OneVsOne = "1v1",
    TwoVsTwo = "2v2"
}
