import { UnitEffectDto } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { BaseUnitEffect } from "./base-unit-effect";
import { UnitEffectDisplayStat } from "./types";
/**
 * Effect applied when a unit has been in melee combat.
 * Used to track recent melee engagement status.
 */
export declare class BeenInMelee extends BaseUnitEffect {
    static readonly id = 2;
    static readonly name = "been_in_melee";
    reorgDebuff: number;
    constructor(duration: number, reorgDebuff: number);
    onAdded(unit: BaseUnit): void;
    onTickStart(unit: BaseUnit): void;
    merge(other: BeenInMelee): void;
    toDto(): UnitEffectDto;
    getDisplayStats(unit: BaseUnit): UnitEffectDisplayStat[];
}
