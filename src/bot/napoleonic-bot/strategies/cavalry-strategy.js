"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CavalryStrategy = void 0;
const types_1 = require("@lob-sdk/types");
const vector_1 = require("@lob-sdk/vector");
const formation_utils_1 = require("../formation-utils");
const data_structures_1 = require("@lob-sdk/data-structures");
/**
 * Strategy for cavalry: flank protection.
 */
class CavalryStrategy {
    _bot;
    static UNIT_SPACING = 40;
    static LINE_SPACING = 32;
    static REAR_OFFSET = -160; // Behind infantry
    static MAX_CHARGE_DISTANCE = 600;
    static INFANTRY_LINE_RADIUS = 400;
    static MAX_CHARGERS_PER_TARGET = 2;
    static OBSTACLE_RADIUS = 40;
    static ISOLATION_RADIUS = 250;
    _assignedUnits = new data_structures_1.KeyedList();
    constructor(_bot) {
        this._bot = _bot;
    }
    assignOrders(units, context) {
        const { game, visibleEnemies, orders, formationChanges, formationCenter, direction, perpendicular, mainBodyWidth } = context;
        if (this._assignedUnits.hasCompositionChanged(units, u => u.id)) {
            this._assignedUnits.setOrder((0, formation_utils_1.sortUnitsAlongVector)(units, perpendicular).map(u => u.id));
        }
        this._assignedUnits.sync(units, u => u.id);
        const sortedUnits = this._assignedUnits.getValues();
        const cavalrySplit = (0, formation_utils_1.splitCavalry)(sortedUnits);
        // Left Flank
        const leftPositions = (0, formation_utils_1.calculateFlankPositions)(cavalrySplit.left, formationCenter, direction, perpendicular, -mainBodyWidth / 2 - CavalryStrategy.UNIT_SPACING, CavalryStrategy.LINE_SPACING, game, 2, CavalryStrategy.REAR_OFFSET);
        const allCavalry = sortedUnits;
        const chargeAssignments = new Map();
        const chargerCounts = new Map();
        if (!context.isRetreating) {
            const potentialCharges = this._getPotentialCharges(allCavalry, visibleEnemies, formationCenter);
            for (const charge of potentialCharges) {
                const unitId = charge.unit.id;
                const targetId = charge.target.id;
                if (chargeAssignments.has(unitId))
                    continue;
                const count = chargerCounts.get(targetId) || 0;
                if (count < CavalryStrategy.MAX_CHARGERS_PER_TARGET) {
                    chargeAssignments.set(unitId, charge.target);
                    chargerCounts.set(targetId, count + 1);
                }
            }
        }
        this._assignFlankOrders(cavalrySplit.left, leftPositions, chargeAssignments, context);
        // Right Flank
        const rightPositions = (0, formation_utils_1.calculateFlankPositions)(cavalrySplit.right, formationCenter, direction, perpendicular, mainBodyWidth / 2 + CavalryStrategy.UNIT_SPACING, CavalryStrategy.LINE_SPACING, game, 2, CavalryStrategy.REAR_OFFSET);
        this._assignFlankOrders(cavalrySplit.right, rightPositions, chargeAssignments, context);
    }
    _assignFlankOrders(units, positions, chargeAssignments, context) {
        const { game, orders, formationChanges, direction } = context;
        units.forEach((unit, i) => {
            const assignedTarget = chargeAssignments.get(unit.id);
            let targetPos = positions[i];
            let orderType = types_1.OrderType.Walk;
            let targetRotation = direction.angle();
            // Refers to the current AI retreating
            if (context.isRetreating) {
                let movesTowardsEnemyObjective = false;
                if (context.closestEnemyObjectivePos && targetPos) {
                    const currentDist = unit.position.distanceTo(context.closestEnemyObjectivePos);
                    const targetDist = targetPos.distanceTo(context.closestEnemyObjectivePos);
                    movesTowardsEnemyObjective = targetDist < currentDist - 1;
                }
                orderType = movesTowardsEnemyObjective
                    ? types_1.OrderType.Walk
                    : types_1.OrderType.Fallback;
            }
            else if (assignedTarget) {
                targetPos = assignedTarget.position;
                orderType = types_1.OrderType.Run;
                targetRotation = targetPos.subtract(unit.position).angle();
            }
            if (!targetPos)
                return;
            if (assignedTarget) {
                orders.push({
                    id: unit.id,
                    type: types_1.OrderType.Run,
                    targetId: assignedTarget.id,
                });
            }
            else {
                if (targetPos && !context.isRetreating) {
                    targetPos = (0, formation_utils_1.findPreferredTerrain)(targetPos, game, this._bot.getGameDataManager(), this.getTerrainPreference(), 3);
                }
                orders.push({
                    id: unit.id,
                    type: orderType,
                    path: (0, formation_utils_1.calculatePath)(unit.position, targetPos, unit, game, this._bot.getGameDataManager()).map((p) => p.toArray()),
                    rotation: targetRotation,
                });
            }
            // Target formation for cavalry
            const targetFormation = "line";
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
                [types_1.TerrainCategoryType.Land]: 1,
                [types_1.TerrainCategoryType.Path]: 1,
                [types_1.TerrainCategoryType.Forest]: 2,
                [types_1.TerrainCategoryType.Building]: 3,
                [types_1.TerrainCategoryType.ShallowWater]: 4,
            },
        };
    }
    _getPotentialCharges(myUnits, visibleEnemies, formationCenter) {
        const potentialCharges = [];
        for (const unit of myUnits) {
            for (const enemy of visibleEnemies) {
                const dist = unit.position.distanceTo(enemy.position);
                if (dist > CavalryStrategy.MAX_CHARGE_DISTANCE)
                    continue;
                if (this._isPriorityTarget(unit, enemy, formationCenter, visibleEnemies) &&
                    !this._isPathBlocked(unit, enemy, visibleEnemies)) {
                    potentialCharges.push({ unit, target: enemy, dist });
                }
            }
        }
        // Sort by distance to prioritize closer charges
        return potentialCharges.sort((a, b) => a.dist - b.dist);
    }
    _isPriorityTarget(unit, enemy, formationCenter, visibleEnemies) {
        const enemyGroup = this._bot.getGroup(enemy.category);
        // 1. Enemy cav near infantry line
        if (enemyGroup === "cavalry") {
            const distToFormation = enemy.position.distanceTo(formationCenter);
            if (distToFormation < CavalryStrategy.INFANTRY_LINE_RADIUS) {
                return true;
            }
        }
        // 2. Weak enemy infantry or isolated support
        const isWeakInfantry = enemyGroup === "infantry" && enemy.getOrgProportion() <= unit.getOrgProportion() - 0.3;
        if (isWeakInfantry ||
            enemyGroup === "artillery" ||
            enemyGroup === "skirmishers") {
            if (enemy.isRouting()) {
                // If routing, only charge if isolated from non-routing allies
                const isSupported = visibleEnemies.some(other => {
                    if (other.id === enemy.id || other.player !== enemy.player)
                        return false;
                    if (other.isRouting())
                        return false;
                    return other.position.distanceTo(enemy.position) <= CavalryStrategy.ISOLATION_RADIUS;
                });
                if (isSupported)
                    return false;
            }
            else if (enemyGroup === "artillery" || enemyGroup === "skirmishers") {
                // If it's a healthy support unit, still check if it's isolated from main combat units
                const isSupported = visibleEnemies.some(other => {
                    if (other.id === enemy.id || other.player !== enemy.player)
                        return false;
                    if (other.isRouting())
                        return false;
                    const oGroup = this._bot.getGroup(other.category);
                    if (oGroup !== "infantry" && oGroup !== "cavalry")
                        return false;
                    return other.position.distanceTo(enemy.position) <= CavalryStrategy.ISOLATION_RADIUS;
                });
                if (isSupported)
                    return false;
            }
            return true;
        }
        return false;
    }
    _isPathBlocked(unit, target, enemies) {
        for (const enemy of enemies) {
            if (enemy.id === target.id)
                continue;
            const enemyGroup = this._bot.getGroup(enemy.category);
            // "Solid" units: infantry with relative org parity or better
            const isSolid = enemyGroup === "infantry" && enemy.getOrgProportion() > unit.getOrgProportion() - 0.3;
            if (isSolid) {
                const dist = this._distanceToSegment(enemy.position, unit.position, target.position);
                if (dist < CavalryStrategy.OBSTACLE_RADIUS) {
                    return true;
                }
            }
        }
        return false;
    }
    _distanceToSegment(p, a, b) {
        const l2 = a.squaredDistanceTo(b);
        if (l2 === 0)
            return p.distanceTo(a);
        let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projection = new vector_1.Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
        return p.distanceTo(projection);
    }
}
exports.CavalryStrategy = CavalryStrategy;
