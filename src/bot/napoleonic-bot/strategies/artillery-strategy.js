"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtilleryStrategy = void 0;
const types_1 = require("@lob-sdk/types");
const formation_utils_1 = require("../formation-utils");
const types_2 = require("@lob-sdk/types");
const data_structures_1 = require("@lob-sdk/data-structures");
/**
 * Strategy for artillery: always run to position, but prefer high ground
 * and stop if in range of enemies.
 */
class ArtilleryStrategy {
    _bot;
    static UNIT_SPACING = 60; // 40 * 1.5
    static LINE_SPACING = 32;
    _assignedUnits = new data_structures_1.KeyedList();
    constructor(_bot) {
        this._bot = _bot;
    }
    assignOrders(units, context) {
        const { game, visibleEnemies, orders, formationChanges, formationCenter, direction, perpendicular, } = context;
        if (this._assignedUnits.hasCompositionChanged(units, u => u.id)) {
            this._assignedUnits.setOrder((0, formation_utils_1.sortUnitsAlongVector)(units, perpendicular).map(u => u.id));
        }
        this._assignedUnits.sync(units, u => u.id);
        const sortedUnits = this._assignedUnits.getValues();
        const baseTargetPositions = (0, formation_utils_1.calculateLinePositions)(sortedUnits, formationCenter, direction, perpendicular, -ArtilleryStrategy.LINE_SPACING, // Second line (behind skirmishers)
        ArtilleryStrategy.UNIT_SPACING, game);
        sortedUnits.forEach((unit, i) => {
            let targetPos = baseTargetPositions[i];
            if (!targetPos)
                return;
            // 1. Terrain Preference
            targetPos = (0, formation_utils_1.findPreferredTerrain)(targetPos, game, this._bot.getGameDataManager(), this.getTerrainPreference(), 4);
            let targetRotation = direction.angle();
            // 2. Stop if in range (unless retreating)
            const range = unit.getMaxRange();
            const nearbyEnemies = visibleEnemies.filter((enemy) => unit.position.distanceTo(enemy.position) <= range);
            const inRangeOfAnyEnemy = !context.isRetreating && nearbyEnemies.length > 0;
            // If we are already in range, we might want to stay put 
            // instead of moving closer to the formation center.
            if (inRangeOfAnyEnemy) {
                targetPos = unit.position;
            }
            orders.push({
                id: unit.id,
                type: types_1.OrderType.Run,
                path: (0, formation_utils_1.calculatePath)(unit.position, targetPos, unit, game, this._bot.getGameDataManager()).map(p => p.toArray()),
                rotation: targetRotation,
            });
            // Target formation for artillery
            const targetFormation = "artillery";
            if (unit.currentFormation !== targetFormation) {
                formationChanges.push({
                    unitId: unit.id,
                    formationId: targetFormation,
                });
            }
        });
    }
    getTerrainPreference() {
        return {
            preferHighGround: true,
            categoryPriority: {
                [types_2.TerrainCategoryType.Land]: 1,
                [types_2.TerrainCategoryType.Path]: 1,
                [types_2.TerrainCategoryType.Forest]: 2,
                [types_2.TerrainCategoryType.Building]: 3,
                [types_2.TerrainCategoryType.ShallowWater]: 4,
            },
        };
    }
}
exports.ArtilleryStrategy = ArtilleryStrategy;
