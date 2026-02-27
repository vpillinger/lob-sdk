import { BaseUnit } from "@lob-sdk/unit";
import { BaseUnitEffect } from "./base-unit-effect";
import { UnitEffectDisplayStat } from "./types";
/**
 * Effect applied when a unit has started routing.
 * Used to track units that have recently begun routing and affects recovery behavior.
 */
export declare class StartedRouting extends BaseUnitEffect {
    static readonly id = 4;
    static readonly name = "started_routing";
    merge(other: StartedRouting): void;
    getDisplayStats(unit: BaseUnit): UnitEffectDisplayStat[];
    getOrgRadiusValue(unit: BaseUnit): number;
}
