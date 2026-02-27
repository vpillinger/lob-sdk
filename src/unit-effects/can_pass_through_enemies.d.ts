import { BaseUnit } from "@lob-sdk/unit";
import { BaseUnitEffect } from "./base-unit-effect";
import { UnitEffectDisplayStat } from "./types";
export declare class CanPassThroughEnemies extends BaseUnitEffect {
    static readonly id = 6;
    static readonly name = "can_pass_through_enemies";
    getDisplayStats(unit: BaseUnit): UnitEffectDisplayStat[];
}
