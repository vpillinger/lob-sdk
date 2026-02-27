import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext, INapoleonicBot } from "../types";
/**
 * Strategy for infantry: multi-line formations with dynamic orders and formations.
 */
export declare class InfantryStrategy implements NapoleonicBotStrategy {
    private _bot;
    private static readonly UNIT_SPACING;
    private static readonly LINE_SPACING;
    private static readonly MAX_CHARGERS_PER_TARGET;
    private _assignedUnits;
    constructor(_bot: INapoleonicBot);
    assignOrders(units: BaseUnit[], context: NapoleonicBotStrategyContext): void;
    private _maintainAssignedUnits;
    private _handleRoutingReplenishment;
    private _assignOrdersToLine;
    private _processUnitOrder;
    private _getBestChargeTarget;
    private _isEnemyOnPath;
    private _distanceToSegment;
    getTerrainPreference(): {
        preferHighGround: boolean;
        categoryPriority: {
            building: number;
            forest: number;
            land: number;
            path: number;
            shallowWater: number;
        };
    };
    /**
     * Detects which sides (quadrants) of a unit are threatened by enemies
     * without allied protection.
     * @returns Array of booleans [Front, Back, Right, Left]
     */
    private _getThreatenedQuads;
}
