import { OrderType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext } from "../types";
import { calculateLinePositions } from "../formation-utils";

/**
 * Strategy for skirmishers: dynamic based on enemies and stamina.
 */
export class SkirmisherStrategy implements NapoleonicBotStrategy {
  private static readonly UNIT_SPACING = 40;

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
      perpendicular 
    } = context;

    const targetPositions = calculateLinePositions(
      units,
      formationCenter,
      direction,
      perpendicular,
      0, // Front line
      SkirmisherStrategy.UNIT_SPACING,
      game,
    );

    units.forEach((unit, i) => {
      const targetPos = targetPositions[i];
      if (!targetPos) return;

      const range = unit.getMaxRange();
      const threshold = range * 2;

      const isEnemyNear = visibleEnemies.some(
        (e) => unit.position.distanceTo(e.position) <= threshold,
      );

      let orderType: OrderType = OrderType.Walk;

      if (isEnemyNear) {
        orderType = OrderType.FireAndAdvance;
      } else {
        const staminaProportion = unit.getStaminaProportion();
        if (staminaProportion >= 0.75) {
          orderType = OrderType.Run;
        } else {
          orderType = OrderType.Walk;
        }
      }

      orders.push({
        id: unit.id,
        type: orderType,
        path: [targetPos.toArray()],
        rotation: direction.angle(),
      });

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
}
