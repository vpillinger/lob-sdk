"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkirmisherStrategy = void 0;
const types_1 = require("@lob-sdk/types");
const formation_utils_1 = require("../formation-utils");
const data_structures_1 = require("@lob-sdk/data-structures");
/**
 * Strategy for skirmishers: dynamic based on enemies and stamina.
 */
class SkirmisherStrategy {
    _bot;
    static UNIT_SPACING = 64;
    static SEARCH_ENEMY_RANGE = 180;
    _assignedUnits = new data_structures_1.KeyedList();
    constructor(_bot) {
        this._bot = _bot;
    }
    assignOrders(units, context) {
        const { game, visibleEnemies, orders, formationChanges, formationCenter, direction, perpendicular } = context;
        if (this._assignedUnits.hasCompositionChanged(units, u => u.id)) {
            this._assignedUnits.setOrder((0, formation_utils_1.sortUnitsAlongVector)(units, perpendicular).map(u => u.id));
        }
        this._assignedUnits.sync(units, u => u.id);
        const sortedUnits = this._assignedUnits.getValues();
        const targetPositions = (0, formation_utils_1.calculateLinePositions)(sortedUnits, formationCenter, direction, perpendicular, 0, // Front line
        SkirmisherStrategy.UNIT_SPACING, game);
        const gameDataManager = this._bot.getGameDataManager();
        sortedUnits.forEach((unit, i) => {
            const nearbyEnemies = visibleEnemies.filter((e) => unit.position.distanceTo(e.position) <= SkirmisherStrategy.SEARCH_ENEMY_RANGE);
            if (context.isRetreating) {
                let targetPos = targetPositions[i];
                if (!targetPos)
                    return;
                let movesTowardsEnemyObjective = false;
                if (context.closestEnemyObjectivePos) {
                    const currentDist = unit.position.distanceTo(context.closestEnemyObjectivePos);
                    const targetDist = targetPos.distanceTo(context.closestEnemyObjectivePos);
                    movesTowardsEnemyObjective = targetDist < currentDist - 1;
                }
                orders.push({
                    id: unit.id,
                    type: movesTowardsEnemyObjective ? types_1.OrderType.Walk : types_1.OrderType.Fallback,
                    path: (0, formation_utils_1.calculatePath)(unit.position, targetPos, unit, game, gameDataManager).map(p => p.toArray()),
                    rotation: direction.angle(),
                });
            }
            else if (nearbyEnemies.length > 0) {
                // Find closest enemy for general targeting
                const closestEnemy = nearbyEnemies.reduce((prev, curr) => unit.position.distanceTo(curr.position) < unit.position.distanceTo(prev.position) ? curr : prev);
                // Check if unit is in cover
                const terrain = game.getUnitTerrain(unit);
                const terrainCategory = gameDataManager.getCategoryByTerrain(terrain);
                const isInCover = terrainCategory === types_1.TerrainCategoryType.Forest ||
                    terrainCategory === types_1.TerrainCategoryType.Building;
                if (isInCover) {
                    // Stay where you are and shoot if in cover
                    orders.push({
                        id: unit.id,
                        type: types_1.OrderType.Shoot,
                        targetId: closestEnemy.id,
                    });
                }
                else {
                    // If not in cover, use Fallback Follow order on the closest "core" enemy (non-skirmisher)
                    const coreEnemies = nearbyEnemies.filter(e => e.category !== "skirmishInfantry");
                    const fallbackTarget = coreEnemies.length > 0
                        ? coreEnemies.reduce((prev, curr) => unit.position.distanceTo(curr.position) < unit.position.distanceTo(prev.position) ? curr : prev)
                        : closestEnemy;
                    orders.push({
                        id: unit.id,
                        type: types_1.OrderType.Fallback,
                        targetId: fallbackTarget.id,
                    });
                }
            }
            else {
                // No enemies near, normal movement to assigned slot
                let targetPos = targetPositions[i];
                if (!targetPos)
                    return;
                // Prefers cover (forests, buildings) if nearby
                targetPos = (0, formation_utils_1.findPreferredTerrain)(targetPos, game, gameDataManager, this.getTerrainPreference(), 4);
                const staminaProportion = unit.getStaminaProportion();
                const orderType = staminaProportion >= 0.75 ? types_1.OrderType.Run : types_1.OrderType.Walk;
                orders.push({
                    id: unit.id,
                    type: orderType,
                    path: (0, formation_utils_1.calculatePath)(unit.position, targetPos, unit, game, gameDataManager).map(p => p.toArray()),
                    rotation: direction.angle(),
                });
            }
            // Target formation for skirmishers
            const targetFormation = "skirmish";
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
            preferHighGround: false,
            categoryPriority: {
                [types_1.TerrainCategoryType.Building]: 1,
                [types_1.TerrainCategoryType.Forest]: 2,
                [types_1.TerrainCategoryType.Land]: 3,
                [types_1.TerrainCategoryType.Path]: 3,
                [types_1.TerrainCategoryType.ShallowWater]: 4,
            },
        };
    }
}
exports.SkirmisherStrategy = SkirmisherStrategy;
