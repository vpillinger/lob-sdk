import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext, INapoleonicBot } from "../types";
/**
 * Strategy for cavalry: flank protection.
 */
export declare class CavalryStrategy implements NapoleonicBotStrategy {
    private _bot;
    private static readonly UNIT_SPACING;
    private static readonly LINE_SPACING;
    private static readonly REAR_OFFSET;
    private static readonly MAX_CHARGE_DISTANCE;
    private static readonly INFANTRY_LINE_RADIUS;
    private static readonly MAX_CHARGERS_PER_TARGET;
    private static readonly OBSTACLE_RADIUS;
    private static readonly ISOLATION_RADIUS;
    private _assignedUnits;
    constructor(_bot: INapoleonicBot);
    assignOrders(units: BaseUnit[], context: NapoleonicBotStrategyContext): void;
    private _assignFlankOrders;
    getTerrainPreference(): {
        preferHighGround: boolean;
        categoryPriority: {
            land: number;
            path: number;
            forest: number;
            building: number;
            shallowWater: number;
        };
    };
    private _getPotentialCharges;
    private _isPriorityTarget;
    private _isPathBlocked;
    private _distanceToSegment;
}
