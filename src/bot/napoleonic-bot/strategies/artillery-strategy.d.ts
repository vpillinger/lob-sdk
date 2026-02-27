import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext, INapoleonicBot } from "../types";
/**
 * Strategy for artillery: always run to position, but prefer high ground
 * and stop if in range of enemies.
 */
export declare class ArtilleryStrategy implements NapoleonicBotStrategy {
    private _bot;
    private static readonly UNIT_SPACING;
    private static readonly LINE_SPACING;
    private _assignedUnits;
    constructor(_bot: INapoleonicBot);
    assignOrders(units: BaseUnit[], context: NapoleonicBotStrategyContext): void;
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
}
