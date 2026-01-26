import { OrderType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext, INapoleonicBot } from "../types";
import { Vector2 } from "@lob-sdk/vector";
import { calculateFlankPositions, splitCavalry, sortUnitsAlongVector, calculatePath } from "../formation-utils";

/**
 * Strategy for cavalry: flank protection.
 */
export class CavalryStrategy implements NapoleonicBotStrategy {
  private static readonly UNIT_SPACING = 40;
  private static readonly LINE_SPACING = 32;
  private static readonly REAR_OFFSET = -160; // Behind infantry
  private static readonly CHARGE_ORG_THRESHOLD = 0.6;
  private static readonly MAX_CHARGE_DISTANCE = 600;
  private static readonly INFANTRY_LINE_RADIUS = 400;
  private static readonly MAX_CHARGERS_PER_TARGET = 2;
  private static readonly OBSTACLE_RADIUS = 40;
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
      mainBodyWidth 
    } = context;

    if (units.length === 0) {
      this._assignedUnitIds = [];
      return;
    }

    // Check composition
    const currentIds = units.map(u => String(u.id)).sort();
    const assignedIdsSorted = [...this._assignedUnitIds].sort();
    const compositionChanged = currentIds.length !== assignedIdsSorted.length || 
                                 currentIds.some((id, i) => id !== assignedIdsSorted[i]);

    if (compositionChanged) {
      const sorted = sortUnitsAlongVector(units, perpendicular);
      this._assignedUnitIds = sorted.map(u => String(u.id));
    }

    const sortedUnits = this._assignedUnitIds
      .map(id => units.find(u => String(u.id) === id))
      .filter((u): u is BaseUnit => u !== undefined);

    const cavalrySplit = splitCavalry(sortedUnits);
    
    // Left Flank
    const leftPositions = calculateFlankPositions(
      cavalrySplit.left,
      formationCenter,
      direction,
      perpendicular,
      -mainBodyWidth / 2 - CavalryStrategy.UNIT_SPACING,
      CavalryStrategy.LINE_SPACING,
      game,
      2,
      CavalryStrategy.REAR_OFFSET
    );

    const allCavalry = sortedUnits;
    const chargeAssignments = new Map<string, BaseUnit>();
    const chargerCounts = new Map<string, number>();

    if (!context.isRetreating) {
      const potentialCharges: { unit: BaseUnit; target: BaseUnit; dist: number }[] = [];

      for (const unit of allCavalry) {
        for (const enemy of visibleEnemies) {
          const dist = unit.position.distanceTo(enemy.position);
          if (dist > CavalryStrategy.MAX_CHARGE_DISTANCE) continue;

          if (this._isPriorityTarget(enemy, formationCenter) && !this._isPathBlocked(unit, enemy, visibleEnemies)) {
            potentialCharges.push({ unit, target: enemy, dist });
          }
        }
      }

      // Sort by distance to prioritize closer charges
      potentialCharges.sort((a, b) => a.dist - b.dist);

      for (const charge of potentialCharges) {
        const unitId = String(charge.unit.id);
        const targetId = String(charge.target.id);

        if (chargeAssignments.has(unitId)) continue;

        const count = chargerCounts.get(targetId) || 0;
        if (count < CavalryStrategy.MAX_CHARGERS_PER_TARGET) {
          chargeAssignments.set(unitId, charge.target);
          chargerCounts.set(targetId, count + 1);
        }
      }
    }

    cavalrySplit.left.forEach((unit, i) => {
      const assignedTarget = chargeAssignments.get(String(unit.id));
      let targetPos = leftPositions[i];
      let orderType: OrderType = OrderType.Walk;
      let targetRotation = direction.angle();

      if (context.isRetreating) {
        orderType = OrderType.Fallback;
      } else if (assignedTarget) {
        targetPos = assignedTarget.position;
        orderType = OrderType.Run;
        targetRotation = targetPos.subtract(unit.position).angle();
      }

      if (!targetPos) return;

      if (assignedTarget) {
        orders.push({
          id: unit.id,
          type: OrderType.Run,
          targetId: assignedTarget.id,
        } as any);
      } else {
        orders.push({
          id: unit.id,
          type: orderType,
          path: calculatePath(
            unit.position,
            targetPos,
            unit,
            game,
            this._bot.getGameDataManager()
          ).map(p => p.toArray()),
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

    // Right Flank
    const rightPositions = calculateFlankPositions(
      cavalrySplit.right,
      formationCenter,
      direction,
      perpendicular,
      mainBodyWidth / 2 + CavalryStrategy.UNIT_SPACING,
      CavalryStrategy.LINE_SPACING,
      game,
      2,
      CavalryStrategy.REAR_OFFSET
    );

    cavalrySplit.right.forEach((unit, i) => {
      const assignedTarget = chargeAssignments.get(String(unit.id));
      let targetPos = rightPositions[i];
      let orderType: OrderType = OrderType.Walk;
      let targetRotation = direction.angle();

      if (context.isRetreating) {
        orderType = OrderType.Fallback;
      } else if (assignedTarget) {
        targetPos = assignedTarget.position;
        orderType = OrderType.Run;
        targetRotation = targetPos.subtract(unit.position).angle();
      }

      if (!targetPos) return;

      if (assignedTarget) {
        orders.push({
          id: unit.id,
          type: OrderType.Run,
          targetId: assignedTarget.id,
        } as any);
      } else {
        orders.push({
          id: unit.id,
          type: orderType,
          path: calculatePath(
            unit.position,
            targetPos,
            unit,
            game,
            this._bot.getGameDataManager()
          ).map(p => p.toArray()),
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

  private _isPriorityTarget(enemy: BaseUnit, formationCenter: Vector2): boolean {
    const enemyGroup = this._bot.getGroup(enemy.category);

    // 1. Enemy cav near infantry line
    if (enemyGroup === "cavalry") {
      const distToFormation = enemy.position.distanceTo(formationCenter);
      if (distToFormation < CavalryStrategy.INFANTRY_LINE_RADIUS) {
        return true;
      }
    }

    // 2. Weak enemy infantry
    if (enemyGroup === "infantry" && enemy.getOrgProportion() <= CavalryStrategy.CHARGE_ORG_THRESHOLD) {
      return true;
    }

    return false;
  }

  private _isPathBlocked(unit: BaseUnit, target: BaseUnit, enemies: BaseUnit[]): boolean {
    for (const enemy of enemies) {
      if (enemy.id === target.id) continue;

      const enemyGroup = this._bot.getGroup(enemy.category);
      // "Solid" units: infantry with > 60% org
      const isSolid = enemyGroup === "infantry" && enemy.getOrgProportion() > CavalryStrategy.CHARGE_ORG_THRESHOLD;

      if (isSolid) {
        const dist = this._distanceToSegment(enemy.position, unit.position, target.position);
        if (dist < CavalryStrategy.OBSTACLE_RADIUS) {
          return true;
        }
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
}
