"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseObjective = void 0;
const entity_1 = require("@lob-sdk/entity");
const types_1 = require("@lob-sdk/types");
class BaseObjective extends entity_1.Entity {
    entityType = entity_1.EntityType.Objective;
    /**
     * Gets the effective victory points for this objective.
     * If victoryPoints undefined, returns the default value based on objective type.
     * @param gameDataManager - The game data manager to access game constants
     * @returns The effective victory points value
     */
    getVictoryPoints(gameDataManager) {
        // If victory points are explicitly set and not 0, use them
        if (this._victoryPoints !== undefined) {
            return this._victoryPoints;
        }
        // Otherwise, use default based on objective type
        const { VP_BIG_DEFAULT_POINTS, VP_SMALL_DEFAULT_POINTS } = gameDataManager.getGameConstants();
        return this.type === types_1.ObjectiveType.Big
            ? VP_BIG_DEFAULT_POINTS
            : VP_SMALL_DEFAULT_POINTS;
    }
}
exports.BaseObjective = BaseObjective;
