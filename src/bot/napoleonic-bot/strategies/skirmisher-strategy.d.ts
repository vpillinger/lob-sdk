import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext, INapoleonicBot } from "../types";
/**
 * Strategy for skirmishers: dynamic based on enemies and stamina.
 */
export declare class SkirmisherStrategy implements NapoleonicBotStrategy {
    private _bot;
    private static readonly UNIT_SPACING;
    private static readonly SEARCH_ENEMY_RANGE;
    private _assignedUnits;
    constructor(_bot: INapoleonicBot);
    assignOrders(units: BaseUnit[], context: NapoleonicBotStrategyContext): void;
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
}
