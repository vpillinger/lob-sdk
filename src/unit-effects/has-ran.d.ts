import { BaseUnit } from "@lob-sdk/unit/base-unit";
import { BaseUnitEffect } from "./base-unit-effect";
import { UnitEffectDisplayStat } from "./types";
/**
 * Effect applied when a unit has been running.
 * Used to track recent running movement and affects various unit behaviors.
 */
export declare class HasRan extends BaseUnitEffect {
    static readonly id = 3;
    static readonly name = "has_ran";
    getDisplayStats(unit: BaseUnit): UnitEffectDisplayStat[];
}
