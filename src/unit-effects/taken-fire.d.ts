import { UnitEffectDto } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { BaseUnitEffect } from "./base-unit-effect";
import { UnitEffectDisplayStat } from "./types";
/**
 * Effect applied when a unit has taken fire from enemies.
 * Affects charge resistance and other combat behaviors.
 */
export declare class TakenFire extends BaseUnitEffect {
    static readonly id = 5;
    static readonly name = "taken_fire";
    reorgDebuff: number;
    constructor(duration: number, reorgDebuff: number);
    onAdded(unit: BaseUnit): void;
    onTickStart(unit: BaseUnit): void;
    merge(other: TakenFire): void;
    toDto(): UnitEffectDto;
    getDisplayStats(unit: BaseUnit): UnitEffectDisplayStat[];
}
