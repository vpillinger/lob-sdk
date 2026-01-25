import { OrderType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext } from "../types";
import { calculateLinePositions, splitIntoLines } from "../formation-utils";

/**
 * Strategy for infantry: multi-line formations with dynamic orders and formations.
 */
export class InfantryStrategy implements NapoleonicBotStrategy {
  private static readonly UNIT_SPACING = 48;
  private static readonly LINE_SPACING = 48;

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

    // Split infantry into at most 2 lines, ensuring each line has at least 10 units (priority)
    // and no line exceeds 50% of the total units.
    let unitsPerLine = units.length;
    if (units.length >= 20) {
      unitsPerLine = Math.ceil(units.length / 2);
    }

    const infantryLines = splitIntoLines(units, unitsPerLine);
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

        let orderType: OrderType = OrderType.Walk;
        let targetFormation = "line";

        if (isEnemyNear) {
          orderType = OrderType.FireAndAdvance;
          targetFormation = "line";
        } else {
          orderType = OrderType.Walk;
          targetFormation = "column";
        }

        orders.push({
          id: unit.id,
          type: orderType,
          path: [targetPos.toArray()],
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
}
