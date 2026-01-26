import { IServerGame, OrderType } from "@lob-sdk/types";
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
  clampToMap
} from "../formation-utils";
import { Vector2 } from "@lob-sdk/vector";

/**
 * Strategy for infantry: multi-line formations with dynamic orders and formations.
 */
export class InfantryStrategy implements NapoleonicBotStrategy {
  private static readonly UNIT_SPACING = 48;
  private static readonly LINE_SPACING = 48;
  private _assignedUnitIds: string[] = [];

  constructor(private _bot: INapoleonicBot) {}

  assignOrders(
    units: BaseUnit[],
    context: NapoleonicBotStrategyContext,
  ): void {
    const { 
      game, 
      visibleEnemies, 
      orders, 
      formationChanges, 
      formationCenter, 
      direction, 
      perpendicular, 
    } = context;

    if (units.length === 0) {
      this._assignedUnitIds = [];
      return;
    }

    // Check composition for strict slot assignment
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

    let sortedUnits = this._assignedUnitIds
      .map(id => units.find(u => String(u.id) === id))
      .filter((u): u is BaseUnit => u !== undefined);

    // Split infantry into at most 2 lines
    let unitsPerLine = sortedUnits.length;
    if (sortedUnits.length >= 20) {
      unitsPerLine = Math.ceil(sortedUnits.length / 2);
    }

    // --- Routing Replenishment Logic ---
    // If a front line unit is routing, swap it with the closest functional reserve unit.
    if (sortedUnits.length > unitsPerLine) {
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

    const infantryLines = splitIntoLines(sortedUnits, unitsPerLine);
    infantryLines.forEach((line, index) => {
      const targetPositions = calculateLinePositions(
        line,
        formationCenter,
        direction,
        perpendicular,
        -InfantryStrategy.LINE_SPACING * (index + 2), // Behind artillery
        InfantryStrategy.UNIT_SPACING,
        game,
      );

      line.forEach((unit, i) => {
        const targetPos = targetPositions[i];
        if (!targetPos) return;

        const range = unit.getMaxRange();
        const threshold = range * 2;

        const isEnemyNear = visibleEnemies.some(
          (e) => unit.position.distanceTo(e.position) <= threshold,
        );

        const moveVector = targetPos.subtract(unit.position);
        
        let tacticalTargetPos = targetPos;
        if (isEnemyNear) {
          // Lane-based movement: project current position onto the target line's depth
          const lineForwardOffset = -InfantryStrategy.LINE_SPACING * (index + 2);
          const lineCenter = formationCenter.add(direction.scale(lineForwardOffset));
          const lateralOffset = unit.position.subtract(lineCenter).dot(perpendicular);
          tacticalTargetPos = lineCenter.add(perpendicular.scale(lateralOffset));
          
          // Ensure it's still clamped/valid
          tacticalTargetPos = clampToMap(tacticalTargetPos, game);
        }

        const isMovingBackwards = tacticalTargetPos.subtract(unit.position).dot(direction) < 0;

        // --- Square Formation Logic ---
        const threatenedQuads = this._getThreatenedQuads(
          unit, 
          game, 
          visibleEnemies, 
          direction, 
          perpendicular
        );
        const threatenedSidesCount = threatenedQuads.filter(q => q).length;
        const isThreatenedFromSidesOrRear = threatenedQuads[1] || threatenedQuads[2] || threatenedQuads[3];

        let orderType: OrderType = OrderType.Walk;
        let targetFormation = "column";
        let finalPath = calculatePath(
          unit.position,
          tacticalTargetPos,
          unit,
          game,
          this._bot.getGameDataManager()
        ).map(p => p.toArray());

        if (context.isRetreating) {
          orderType = OrderType.Fallback;
          targetFormation = "column";
        } else if (threatenedSidesCount >= 2) {
          targetFormation = "square";
          orderType = OrderType.Walk; // Keep walk but path is current position
          finalPath = [unit.position.toArray()];
        } else if (isEnemyNear) {
          // If in line/mass and threatened from side/rear, form square
          if (index === 0 && isThreatenedFromSidesOrRear) {
            targetFormation = "square";
            orderType = OrderType.Walk;
            finalPath = [unit.position.toArray()];
          } else {
            // Tactical movement near enemy: always face the enemy (avoid Walk)
            if (isMovingBackwards) {
              orderType = OrderType.Fallback;
            } else {
              orderType = OrderType.FireAndAdvance;
            }

            if (index === 0) {
              // TACO: Use "mass" for the ends of the first line for flank protection
              const isEdge = i === 0 || i === line.length - 1;
              targetFormation = isEdge ? "mass" : "line";
            } else {
              targetFormation = "column";
            }
          }
        } else {
          orderType = OrderType.Walk;
          targetFormation = "column";
        }

        orders.push({
          id: unit.id,
          type: orderType,
          path: finalPath,
          rotation: direction.angle(),
        });

        if (unit.currentFormation !== targetFormation) {
          formationChanges.push({
            unitId: unit.id,
            formationId: targetFormation,
          });
        }
      });
    });
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
    const allUnits = game.getUnits() as BaseUnit[];
    
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
