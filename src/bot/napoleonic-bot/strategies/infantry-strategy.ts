import { IServerGame, OrderType, TerrainCategoryType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { 
  NapoleonicBotStrategy, 
  NapoleonicBotStrategyContext,
  INapoleonicBot
} from "../types";
import { 
  calculateLinePositions, 
  splitIntoLines, 
  sortUnitsAlongVector,
  calculatePath,
  clampToMap,
  findPreferredTerrain,
  isPathClear
} from "../formation-utils";
import { Vector2 } from "@lob-sdk/vector";

/**
 * Strategy for infantry: multi-line formations with dynamic orders and formations.
 */
export class InfantryStrategy implements NapoleonicBotStrategy {
  private static readonly UNIT_SPACING = 48;
  private static readonly LINE_SPACING = 48;
  private static readonly MAX_CHARGERS_PER_TARGET = 2;
  private _assignedUnitIds: string[] = [];

  constructor(private _bot: INapoleonicBot) {}

  assignOrders(
    units: BaseUnit[],
    context: NapoleonicBotStrategyContext,
  ): void {

    if (units.length === 0) {
      this._assignedUnitIds = [];
      return;
    }

    this._maintainAssignedUnits(units, context);

    let sortedUnits = this._assignedUnitIds
      .map(id => units.find(u => String(u.id) === id))
      .filter((u): u is BaseUnit => u !== undefined);

    // Split infantry into at most 2 lines
    let unitsPerLine = sortedUnits.length;
    if (sortedUnits.length >= 20) {
      unitsPerLine = Math.ceil(sortedUnits.length / 2);
    }

    // --- Routing Replenishment Logic ---
    this._handleRoutingReplenishment(sortedUnits, unitsPerLine, context);

    const chargerCounts = new Map<string, number>();

    const infantryLines = splitIntoLines(sortedUnits, unitsPerLine);
    infantryLines.forEach((line, index) => {
      this._assignOrdersToLine(line, index, context, chargerCounts);
    });
  }

  private _maintainAssignedUnits(
    units: BaseUnit[],
    context: NapoleonicBotStrategyContext
  ): void {
    const { game, formationCenter, direction, perpendicular } = context;
    const currentIds = units.map(u => String(u.id));
    const assignedIdsSet = new Set(this._assignedUnitIds);
    const missingIds = this._assignedUnitIds.filter(id => !currentIds.includes(id));
    const addedIds = currentIds.filter(id => !assignedIdsSet.has(id));

    if (addedIds.length > 0 || this._assignedUnitIds.length === 0) {
      const sorted = sortUnitsAlongVector(units, perpendicular);
      this._assignedUnitIds = sorted.map(u => String(u.id));
    } else if (missingIds.length > 0) {
      // Units lost. Replenish front line gaps if any.
      const oldLen = this._assignedUnitIds.length;
      let oldUnitsPerLine = oldLen;
      if (oldLen >= 20) oldUnitsPerLine = Math.ceil(oldLen / 2);

      const frontLinePositions = calculateLinePositions(
        new Array(oldUnitsPerLine).fill(null),
        formationCenter,
        direction,
        perpendicular,
        -InfantryStrategy.LINE_SPACING * 2,
        InfantryStrategy.UNIT_SPACING,
        game,
      );

      for (const mId of missingIds) {
        const mIdx = this._assignedUnitIds.indexOf(mId);
        if (mIdx !== -1 && mIdx < oldUnitsPerLine && frontLinePositions[mIdx]) {
          // Gap in front line. Find closest reserve.
          const gapPos = frontLinePositions[mIdx];
          let bestReserveIdx = -1;
          let minDist = Infinity;

          for (let j = oldUnitsPerLine; j < oldLen; j++) {
            const resId = this._assignedUnitIds[j];
            const resUnit = units.find(u => String(u.id) === resId);
            if (resUnit && !resUnit.isRouting()) {
              const d = resUnit.position.distanceTo(gapPos);
              if (d < minDist) {
                minDist = d;
                bestReserveIdx = j;
              }
            }
          }

          if (bestReserveIdx !== -1) {
            // Swap ID in stable list
            const resId = this._assignedUnitIds[bestReserveIdx];
            this._assignedUnitIds[mIdx] = resId;
            this._assignedUnitIds[bestReserveIdx] = mId;
          }
        }
      }
      this._assignedUnitIds = this._assignedUnitIds.filter(id => currentIds.includes(id));
    }
  }

  private _handleRoutingReplenishment(
    sortedUnits: BaseUnit[],
    unitsPerLine: number,
    context: NapoleonicBotStrategyContext
  ): void {
    const { game, formationCenter, direction, perpendicular } = context;
    if (sortedUnits.length <= unitsPerLine) return;

    const frontLinePositions = calculateLinePositions(
      sortedUnits.slice(0, unitsPerLine),
      formationCenter,
      direction,
      perpendicular,
      -InfantryStrategy.LINE_SPACING * 2,
      InfantryStrategy.UNIT_SPACING,
      game,
    );

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
          const idA = String(unit.id);
          const idB = String(sortedUnits[bestReserveIdx].id);
          const idxA = this._assignedUnitIds.indexOf(idA);
          const idxB = this._assignedUnitIds.indexOf(idB);

          if (idxA !== -1 && idxB !== -1) {
            this._assignedUnitIds[idxA] = idB;
            this._assignedUnitIds[idxB] = idA;
            
            // Local swap for current frame
            const temp = sortedUnits[i];
            sortedUnits[i] = sortedUnits[bestReserveIdx];
            sortedUnits[bestReserveIdx] = temp;
          }
        }
      }
    }
  }

  private _assignOrdersToLine(
    line: BaseUnit[],
    lineIndex: number,
    context: NapoleonicBotStrategyContext,
    chargerCounts: Map<string, number>
  ): void {
    const { 
      game,
      orders, 
      formationChanges, 
      formationCenter, 
      direction, 
      perpendicular,
    } = context;

    const targetPositions = calculateLinePositions(
      line,
      formationCenter,
      direction,
      perpendicular,
      -InfantryStrategy.LINE_SPACING * (lineIndex + 2), // Behind artillery
      InfantryStrategy.UNIT_SPACING,
      game,
    );

    line.forEach((unit, i) => {
      const targetPos = targetPositions[i];
      if (!targetPos) return;

      const { targetFormation, orderType, finalPath, targetRotation } = this._processUnitOrder(
        unit, 
        i, 
        line.length, 
        lineIndex, 
        targetPos, 
        context,
        chargerCounts
      );

      if (targetFormation !== "square") {
        orders.push({
          id: unit.id,
          type: orderType,
          path: finalPath,
          rotation: targetRotation,
        });
      }

      if (unit.currentFormation !== targetFormation) {
        formationChanges.push({
          unitId: unit.id,
          formationId: targetFormation,
        });
      }
    });
  }

  private _processUnitOrder(
    unit: BaseUnit,
    unitIndex: number,
    lineLength: number,
    lineIndex: number,
    targetPos: Vector2,
    context: NapoleonicBotStrategyContext,
    chargerCounts: Map<string, number>
  ): { 
    targetFormation: string; 
    orderType: OrderType.Walk | OrderType.Run | OrderType.FireAndAdvance | OrderType.Fallback; 
    finalPath: [number, number][];
    targetRotation: number;
  } {
    const { 
      game, 
      visibleEnemies, 
      formationCenter, 
      direction, 
      perpendicular,
      isRetreating,
      closestEnemyObjectivePos
    } = context;

    const range = unit.getMaxRange();
    const threshold = range * 2;

    const threatenedQuads: boolean[] = this._getThreatenedQuads(
      unit, 
      game, 
      visibleEnemies, 
      direction, 
      perpendicular
    );
    const threatenedSidesCount = threatenedQuads.filter(q => q).length;

    // --- SQUARE OVERRIDE ---
    // Always form square if 2 or more sides are threatened
    if (threatenedSidesCount >= 2) {
      return {
        targetFormation: "square",
        orderType: OrderType.Walk,
        finalPath: [unit.position.toArray()],
        targetRotation: direction.angle()
      };
    }

    const isEnemyNear = visibleEnemies.some(
      (e) => unit.position.distanceTo(e.position) <= threshold,
    );

    const isThreateningEnemyNear = visibleEnemies.some(
      (e) => unit.position.distanceTo(e.position) <= threshold && !e.isRouting(),
    );

    let tacticalTargetPos = targetPos;
    if (isEnemyNear) {
      // Lane-based movement: project current position onto the target line's depth
      const lineForwardOffset = -InfantryStrategy.LINE_SPACING * (lineIndex + 2);
      const lineCenter = formationCenter.add(direction.scale(lineForwardOffset));
      const lateralOffset = unit.position.subtract(lineCenter).dot(perpendicular);
      tacticalTargetPos = lineCenter.add(perpendicular.scale(lateralOffset));
      
      // Ensure it's still clamped/valid
      tacticalTargetPos = clampToMap(tacticalTargetPos, game);
    }

    // Apply terrain preference if not in immediate tactical movement
    if (!isEnemyNear && !isRetreating) {
      tacticalTargetPos = findPreferredTerrain(
        tacticalTargetPos,
        game,
        this._bot.getGameDataManager(),
        this.getTerrainPreference(),
        2 // Smaller radius for infantry to keep formation cohesion
      );
    }

    const isMovingBackwards = tacticalTargetPos.subtract(unit.position).dot(direction) < 0;



    // --- Formation Selection Logic (Rotation Aware) ---
    const moveDist = unit.position.distanceTo(tacticalTargetPos);
    const moveNormal = moveDist > 1 ? tacticalTargetPos.subtract(unit.position).normalize() : direction;
    const alignment = Math.abs(moveNormal.dot(direction)); // 1 = forward/back, 0 = pure lateral
    
    let targetFormation = "column";
    if (isThreateningEnemyNear) {
      if (lineIndex === 0) {
        const isEdge = unitIndex === 0 || unitIndex === lineLength - 1;
        targetFormation = isEdge ? "mass" : "line";
      } else {
        targetFormation = "column";
      }
    }

    // Only switch to column if moving significantly sideways and far enough
    if (alignment < 0.5 && moveDist > 100) {
      targetFormation = "column";
    }

    let targetRotation = direction.angle();
    let orderType: OrderType = OrderType.Walk;
    let finalPath = calculatePath(
      unit.position,
      tacticalTargetPos,
      unit,
      game,
      this._bot.getGameDataManager()
    ).map(p => p.toArray());

    // --- Predatory Charge Check ---
    // First line units charge isolated support units
    if (lineIndex === 0 && !isRetreating) {
      const isolationRadius = 250;
      const chargeRange = 500;
      const priorityEnemy = visibleEnemies.find(e => {
        const eGroup = this._bot.getGroup(e.category);
        const dist = unit.position.distanceTo(e.position);
        if (dist > chargeRange) return false;
        
        if (eGroup === "artillery" || eGroup === "skirmishers") {
          if (e.isRouting()) return false;
          // Check if isolated
          const isSupported = visibleEnemies.some(other => {
            if (other.id === e.id || other.player !== e.player) return false;
            if (other.isRouting()) return false;
            const oGroup = this._bot.getGroup(other.category);
            if (oGroup !== "infantry" && oGroup !== "cavalry") return false;
        if (other.position.distanceTo(e.position) <= isolationRadius) return true;
          });
          if (isSupported) return false;

          // Check charger count
          const count = chargerCounts.get(String(e.id)) || 0;
          return count < InfantryStrategy.MAX_CHARGERS_PER_TARGET;
        }
        return false;
      });

      if (priorityEnemy) {
        orderType = OrderType.Run;
        targetFormation = "column";
        finalPath = [[priorityEnemy.position.x, priorityEnemy.position.y]];
        
        const targetId = String(priorityEnemy.id);
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

    if (orderType !== OrderType.Run) {
      if (isRetreating) {
        orderType = movesTowardsEnemyObjective ? OrderType.Walk : OrderType.Fallback;
      } else if (isThreateningEnemyNear) {
        if (isMovingBackwards) {
          orderType = movesTowardsEnemyObjective ? OrderType.FireAndAdvance : OrderType.Fallback;
        } else {
          orderType = OrderType.FireAndAdvance;
        }
      } else {
        orderType = OrderType.Walk;
      }
    }

    // --- Second Line Charge Logic ---
    if (lineIndex === 1 && !isRetreating && orderType !== OrderType.Run) {
      const unitOrg = unit.getOrgProportion();
      const runDist = unit.runMovement;
      
      const chargeTarget = visibleEnemies.find(e => {
        if (e.isRouting()) return false;

        const dist = unit.position.distanceTo(e.position);
        if (dist > runDist) return false;

        const eGroup = this._bot.getGroup(e.category);
        const isSkirmisherOrArtillery = eGroup === "skirmishers" || eGroup === "artillery";
        const isCoreUnit = eGroup === "infantry" || eGroup === "cavalry";
        
        if (!isSkirmisherOrArtillery && !isCoreUnit) return false;

        if (isCoreUnit) {
          const eOrg = e.getOrgProportion();
          // "core unit with less absolute 30% org than the unit"
          if (unitOrg - eOrg < 0.3) return false;
        }

        // Check path clearance (terrain)
        if (!isPathClear(unit.position, e.position, game, this._bot.getGameDataManager())) return false;
        
        // Check for other enemies on path (excluding the target itself)
        if (this._isEnemyOnPath(unit, e, visibleEnemies)) return false;

        // Check charger count
        const count = chargerCounts.get(String(e.id)) || 0;
        if (count >= InfantryStrategy.MAX_CHARGERS_PER_TARGET) return false;

        return true;
      });

      if (chargeTarget) {
        orderType = OrderType.Run;
        targetFormation = "column";
        finalPath = [[chargeTarget.position.x, chargeTarget.position.y]];

        const targetId = String(chargeTarget.id);
        chargerCounts.set(targetId, (chargerCounts.get(targetId) || 0) + 1);
      }
    }

    return { targetFormation, orderType, finalPath, targetRotation };
  }

  private _isEnemyOnPath(
    unit: BaseUnit,
    target: BaseUnit,
    visibleEnemies: BaseUnit[]
  ): boolean {
    const obstacleRadius = 40; // Roughly unit size
    for (const enemy of visibleEnemies) {
      if (enemy.id === target.id) continue;
      if (enemy.isRouting()) continue;

      const dist = this._distanceToSegment(enemy.position, unit.position, target.position);
      if (dist < obstacleRadius) {
        return true;
      }
    }
    return false;
  }

  private _distanceToSegment(p: Vector2, a: Vector2, b: Vector2): number {
    const l2 = a.squaredDistanceTo(b);
    if (l2 === 0) return p.distanceTo(a);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = new Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
    return p.distanceTo(projection);
  }

  getTerrainPreference() {
    return {
      preferHighGround: false,
      categoryPriority: {
        [TerrainCategoryType.Building]: 1,
        [TerrainCategoryType.Forest]: 1,
        [TerrainCategoryType.Land]: 1,
        [TerrainCategoryType.Path]: 1,
        [TerrainCategoryType.ShallowWater]: 2,
      },
    };
  }

  /**
   * Detects which sides (quadrants) of a unit are threatened by enemies 
   * without allied protection.
   * @returns Array of booleans [Front, Back, Right, Left]
   */
  private _getThreatenedQuads(
    unit: BaseUnit,
    game: IServerGame,
    visibleEnemies: BaseUnit[],
    direction: Vector2,
    perpendicular: Vector2
  ): boolean[] {
    const threatRadius = 250;
    const quadrants = [
      { vec: direction },           // Front
      { vec: direction.scale(-1) },  // Back
      { vec: perpendicular },       // Right
      { vec: perpendicular.scale(-1) }, // Left
    ];

    const results = [false, false, false, false];
    const allUnits = game.getUnits();
    
    const isCoreUnit = (u: BaseUnit) => {
      const group = this._bot.getGroup(u.category);
      return group === "infantry" || group === "cavalry";
    };

    quadrants.forEach((quad, i) => {
      const isEnemyInQuad = visibleEnemies.some(enemy => {
        const relPos = enemy.position.subtract(unit.position);
        return relPos.length() <= threatRadius && relPos.normalize().dot(quad.vec) > 0.707;
      });

      if (isEnemyInQuad) {
        const isAllyProtecting = allUnits.some((ally: BaseUnit) => {
           if (ally.player !== unit.player || ally.id === unit.id) return false;
           if (!isCoreUnit(ally)) return false;
           const relPos = ally.position.subtract(unit.position);
           return relPos.length() <= threatRadius && relPos.normalize().dot(quad.vec) > 0.707;
        });

        if (!isAllyProtecting) {
          results[i] = true;
        }
      }
    });

    return results;
  }
}
