"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfantryStrategy = void 0;
const types_1 = require("@lob-sdk/types");
const formation_utils_1 = require("../formation-utils");
const vector_1 = require("@lob-sdk/vector");
const data_structures_1 = require("@lob-sdk/data-structures");
/**
 * Strategy for infantry: multi-line formations with dynamic orders and formations.
 */
class InfantryStrategy {
    _bot;
    static UNIT_SPACING = 48;
    static LINE_SPACING = 48;
    static MAX_CHARGERS_PER_TARGET = 1;
    _assignedUnits = new data_structures_1.KeyedList();
    constructor(_bot) {
        this._bot = _bot;
    }
    assignOrders(units, context) {
        this._maintainAssignedUnits(units, context);
        let sortedUnits = this._assignedUnits.getValues();
        // Split infantry into at most 2 lines
        let unitsPerLine = sortedUnits.length;
        if (sortedUnits.length >= 20) {
            unitsPerLine = Math.ceil(sortedUnits.length / 2);
        }
        // --- Routing Replenishment Logic ---
        this._handleRoutingReplenishment(sortedUnits, unitsPerLine, context);
        const chargerCounts = new Map();
        const infantryLines = (0, formation_utils_1.splitIntoLines)(sortedUnits, unitsPerLine);
        infantryLines.forEach((line, index) => {
            this._assignOrdersToLine(line, index, context, chargerCounts);
        });
    }
    _maintainAssignedUnits(units, context) {
        const { game, formationCenter, direction, perpendicular } = context;
        if (this._assignedUnits.hasCompositionChanged(units, u => u.id)) {
            this._assignedUnits.setOrder((0, formation_utils_1.sortUnitsAlongVector)(units, perpendicular).map(u => u.id));
        }
        this._assignedUnits.sync(units, u => u.id);
        // Check for gaps in front line due to losses
        const currentOrder = this._assignedUnits.keys;
        const oldLen = currentOrder.length;
        let oldUnitsPerLine = oldLen;
        if (oldLen >= 20)
            oldUnitsPerLine = Math.ceil(oldLen / 2);
        const frontLinePositions = (0, formation_utils_1.calculateLinePositions)(new Array(oldUnitsPerLine).fill(null), formationCenter, direction, perpendicular, -InfantryStrategy.LINE_SPACING * 2, InfantryStrategy.UNIT_SPACING, game);
        for (let i = 0; i < oldUnitsPerLine; i++) {
            const id = currentOrder[i];
            if (!this._assignedUnits.get(id)) {
                // Found a gap in the stable order positions
                const gapPos = frontLinePositions[i];
                let bestReserveIdx = -1;
                let minDist = Infinity;
                for (let j = oldUnitsPerLine; j < oldLen; j++) {
                    const resId = currentOrder[j];
                    const resUnit = this._assignedUnits.get(resId);
                    if (resUnit && !resUnit.isRouting()) {
                        const d = resUnit.position.distanceTo(gapPos);
                        if (d < minDist) {
                            minDist = d;
                            bestReserveIdx = j;
                        }
                    }
                }
                if (bestReserveIdx !== -1) {
                    this._assignedUnits.swap(id, currentOrder[bestReserveIdx]);
                }
            }
        }
        // Final clean up of missing units from the stable order
        this._assignedUnits.sync(units, u => u.id);
    }
    _handleRoutingReplenishment(sortedUnits, unitsPerLine, context) {
        const { game, formationCenter, direction, perpendicular } = context;
        if (sortedUnits.length <= unitsPerLine)
            return;
        const frontLinePositions = (0, formation_utils_1.calculateLinePositions)(sortedUnits.slice(0, unitsPerLine), formationCenter, direction, perpendicular, -InfantryStrategy.LINE_SPACING * 2, InfantryStrategy.UNIT_SPACING, game);
        for (let i = 0; i < unitsPerLine; i++) {
            const unit = sortedUnits[i];
            if (unit.isRouting()) {
                const gapPos = frontLinePositions[i];
                let bestReserveIdx = -1;
                let minDist = Infinity;
                for (let j = unitsPerLine; j < sortedUnits.length; j++) {
                    const resUnit = sortedUnits[j];
                    if (!resUnit.isRouting()) {
                        const d = resUnit.position.distanceTo(gapPos);
                        if (d < minDist) {
                            minDist = d;
                            bestReserveIdx = j;
                        }
                    }
                }
                if (bestReserveIdx !== -1) {
                    const idA = unit.id;
                    const idB = sortedUnits[bestReserveIdx].id;
                    if (this._assignedUnits.swap(idA, idB)) {
                        // Local swap for current frame
                        const temp = sortedUnits[i];
                        sortedUnits[i] = sortedUnits[bestReserveIdx];
                        sortedUnits[bestReserveIdx] = temp;
                    }
                }
            }
        }
    }
    _assignOrdersToLine(line, lineIndex, context, chargerCounts) {
        const { game, orders, formationChanges, formationCenter, direction, perpendicular, } = context;
        const targetPositions = (0, formation_utils_1.calculateLinePositions)(line, formationCenter, direction, perpendicular, -InfantryStrategy.LINE_SPACING * (lineIndex + 2), // Behind artillery
        InfantryStrategy.UNIT_SPACING, game);
        line.forEach((unit, i) => {
            const targetPos = targetPositions[i];
            if (!targetPos)
                return;
            const { targetFormation, orderType, finalPath, targetRotation, targetId, } = this._processUnitOrder(unit, i, line.length, lineIndex, targetPos, context, chargerCounts);
            if (targetFormation !== "square") {
                if (targetId) {
                    orders.push({
                        id: unit.id,
                        type: orderType,
                        targetId: targetId,
                    });
                }
                else {
                    orders.push({
                        id: unit.id,
                        type: orderType,
                        path: finalPath,
                        rotation: targetRotation,
                    });
                }
            }
            if (unit.currentFormation !== targetFormation) {
                formationChanges.push({
                    unitId: unit.id,
                    formationId: targetFormation,
                });
            }
        });
    }
    _processUnitOrder(unit, unitIndex, lineLength, lineIndex, targetPos, context, chargerCounts) {
        const { game, visibleEnemies, allyUnits, formationCenter, direction, perpendicular, isRetreating, closestEnemyObjectivePos, } = context;
        const range = unit.getMaxRange();
        const threshold = range * 2;
        const threatenedQuads = this._getThreatenedQuads(unit, allyUnits, visibleEnemies, direction, perpendicular);
        const threatenedSidesCount = threatenedQuads.filter((q) => q).length;
        const isBackOrFlankThreatened = threatenedQuads[1] || threatenedQuads[2] || threatenedQuads[3];
        // --- SQUARE OVERRIDE ---
        // Always form square if 2 or more sides are threatened
        if (threatenedSidesCount >= 2) {
            return {
                targetFormation: "square",
                orderType: types_1.OrderType.Walk,
                finalPath: [unit.position.toArray()],
                targetRotation: direction.angle(),
            };
        }
        const isEnemyNear = visibleEnemies.some((e) => unit.position.distanceTo(e.position) <= threshold);
        const isThreateningEnemyNear = visibleEnemies.some((e) => unit.position.distanceTo(e.position) <= threshold && !e.isRouting());
        let tacticalTargetPos = targetPos;
        if (isEnemyNear) {
            // Lane-based movement: project current position onto the target line's depth
            const lineForwardOffset = -InfantryStrategy.LINE_SPACING * (lineIndex + 2);
            const lineCenter = formationCenter.add(direction.scale(lineForwardOffset));
            const lateralOffset = unit.position
                .subtract(lineCenter)
                .dot(perpendicular);
            tacticalTargetPos = lineCenter.add(perpendicular.scale(lateralOffset));
            // Ensure it's still clamped/valid
            tacticalTargetPos = (0, formation_utils_1.clampToMap)(tacticalTargetPos, game);
        }
        // Apply terrain preference if not in immediate tactical movement
        if (!isEnemyNear && !isRetreating) {
            tacticalTargetPos = (0, formation_utils_1.findPreferredTerrain)(tacticalTargetPos, game, this._bot.getGameDataManager(), this.getTerrainPreference(), 2);
        }
        const isMovingBackwards = tacticalTargetPos.subtract(unit.position).dot(direction) < 0;
        // --- Formation Selection Logic (Rotation Aware) ---
        const moveDist = unit.position.distanceTo(tacticalTargetPos);
        const moveNormal = moveDist > 1
            ? tacticalTargetPos.subtract(unit.position).normalize()
            : direction;
        const alignment = Math.abs(moveNormal.dot(direction)); // 1 = forward/back, 0 = pure lateral
        let targetFormation = "column";
        if (isThreateningEnemyNear) {
            if (lineIndex === 0 && !isBackOrFlankThreatened) {
                const isEdge = unitIndex === 0 || unitIndex === lineLength - 1;
                targetFormation = isEdge ? "mass" : "line";
            }
            else {
                targetFormation = "column";
            }
        }
        // Only switch to column if moving significantly sideways and far enough
        if (alignment < 0.5 && moveDist > 100) {
            targetFormation = "column";
        }
        let targetRotation = direction.angle();
        let orderType = types_1.OrderType.Walk;
        let finalPath = (0, formation_utils_1.calculatePath)(unit.position, tacticalTargetPos, unit, game, this._bot.getGameDataManager()).map((p) => p.toArray());
        // --- Unified Charge Check ---
        let targetId = undefined;
        if ((lineIndex === 0 || lineIndex === 1) && !isRetreating) {
            const chargeTarget = this._getBestChargeTarget(unit, visibleEnemies, game, chargerCounts);
            if (chargeTarget) {
                orderType = types_1.OrderType.Run;
                targetFormation = "column";
                targetId = chargeTarget.id;
                finalPath = []; // Pursuit doesn't use path
                chargerCounts.set(targetId, (chargerCounts.get(targetId) || 0) + 1);
            }
        }
        let movesTowardsEnemyObjective = false;
        if (closestEnemyObjectivePos) {
            const currentDist = unit.position.distanceTo(closestEnemyObjectivePos);
            const targetDist = tacticalTargetPos.distanceTo(closestEnemyObjectivePos);
            // Give a small buffer to avoid jitter
            movesTowardsEnemyObjective = targetDist < currentDist - 1;
        }
        if (orderType !== types_1.OrderType.Run) {
            if (isRetreating) {
                orderType = movesTowardsEnemyObjective
                    ? types_1.OrderType.Walk
                    : types_1.OrderType.Fallback;
            }
            else if (isThreateningEnemyNear) {
                if (isMovingBackwards) {
                    orderType = movesTowardsEnemyObjective
                        ? types_1.OrderType.FireAndAdvance
                        : types_1.OrderType.Fallback;
                }
                else {
                    orderType = types_1.OrderType.FireAndAdvance;
                }
            }
            else {
                orderType = types_1.OrderType.Walk;
            }
        }
        return { targetFormation, orderType, finalPath, targetRotation, targetId };
    }
    _getBestChargeTarget(unit, visibleEnemies, game, chargerCounts) {
        const unitOrg = unit.getOrgProportion();
        const chargeRange = Math.max(unit.runMovement, 500);
        return visibleEnemies.find((e) => {
            if (e.isRouting())
                return false;
            const dist = unit.position.distanceTo(e.position);
            if (dist > chargeRange)
                return false;
            const eGroup = this._bot.getGroup(e.category);
            const isSkirmisherOrArtillery = eGroup === "skirmishers" || eGroup === "artillery";
            const isCoreUnit = eGroup === "infantry" || eGroup === "cavalry";
            if (!isSkirmisherOrArtillery && !isCoreUnit)
                return false;
            if (eGroup === "skirmishers") {
                const isolationRadius = 160;
                const isSupported = visibleEnemies.some((other) => {
                    if (other.id === e.id || other.player !== e.player)
                        return false;
                    if (other.isRouting())
                        return false;
                    return other.position.distanceTo(e.position) <= isolationRadius;
                });
                if (isSupported)
                    return false;
            }
            if (isCoreUnit) {
                const eOrg = e.getOrgProportion();
                // Core unit with significantly less organization
                if (unitOrg - eOrg < 0.3)
                    return false;
            }
            // Check path clearance
            if (!(0, formation_utils_1.isPathClear)(unit.position, e.position, game, this._bot.getGameDataManager()))
                return false;
            if (this._isEnemyOnPath(unit, e, visibleEnemies))
                return false;
            // Check charger count
            const count = chargerCounts.get(e.id) || 0;
            if (count >= InfantryStrategy.MAX_CHARGERS_PER_TARGET)
                return false;
            return true;
        });
    }
    _isEnemyOnPath(unit, target, visibleEnemies) {
        const obstacleRadius = 40; // Roughly unit size
        for (const enemy of visibleEnemies) {
            if (enemy.id === target.id)
                continue;
            if (enemy.isRouting())
                continue;
            const dist = this._distanceToSegment(enemy.position, unit.position, target.position);
            if (dist < obstacleRadius) {
                return true;
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
    getTerrainPreference() {
        return {
            preferHighGround: false,
            categoryPriority: {
                [types_1.TerrainCategoryType.Building]: 1,
                [types_1.TerrainCategoryType.Forest]: 1,
                [types_1.TerrainCategoryType.Land]: 1,
                [types_1.TerrainCategoryType.Path]: 1,
                [types_1.TerrainCategoryType.ShallowWater]: 2,
            },
        };
    }
    /**
     * Detects which sides (quadrants) of a unit are threatened by enemies
     * without allied protection.
     * @returns Array of booleans [Front, Back, Right, Left]
     */
    _getThreatenedQuads(unit, allyUnits, visibleEnemies, direction, perpendicular) {
        const threatRadius = 160;
        const quadrants = [
            { vec: direction }, // Front
            { vec: direction.scale(-1) }, // Back
            { vec: perpendicular }, // Right
            { vec: perpendicular.scale(-1) }, // Left
        ];
        const results = [false, false, false, false];
        const isCoreUnit = (u) => {
            const group = this._bot.getGroup(u.category);
            return group === "infantry" || group === "cavalry";
        };
        quadrants.forEach((quad, i) => {
            const isEnemyInQuad = visibleEnemies.some((enemy) => {
                if (enemy.isRouting()) {
                    return false;
                }
                const relPos = enemy.position.subtract(unit.position);
                return (relPos.length() <= threatRadius &&
                    relPos.normalize().dot(quad.vec) > 0.707);
            });
            if (isEnemyInQuad) {
                const isAllyProtecting = allyUnits.some((ally) => {
                    if (ally.isRouting()) {
                        return false;
                    }
                    if (ally.player !== unit.player || ally.id === unit.id)
                        return false;
                    if (!isCoreUnit(ally))
                        return false;
                    const relPos = ally.position.subtract(unit.position);
                    return (relPos.length() <= threatRadius &&
                        relPos.normalize().dot(quad.vec) > 0.707);
                });
                if (!isAllyProtecting) {
                    results[i] = true;
                }
            }
        });
        return results;
    }
}
exports.InfantryStrategy = InfantryStrategy;
