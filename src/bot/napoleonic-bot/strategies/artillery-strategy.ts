import { OrderType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext } from "../types";
import { calculateLinePositions } from "../formation-utils";

/**
 * Strategy for artillery: always run to position.
 */
export class ArtilleryStrategy implements NapoleonicBotStrategy {
  private static readonly UNIT_SPACING = 60; // 40 * 1.5
  private static readonly LINE_SPACING = 32;

  assignOrders(
    units: BaseUnit[],
    context: NapoleonicBotStrategyContext,
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
      units,
      formationCenter,
      direction,
      perpendicular,
      -ArtilleryStrategy.LINE_SPACING, // Second line (behind skirmishers)
      ArtilleryStrategy.UNIT_SPACING,
      game,
    );

    units.forEach((unit, i) => {
      const targetPos = targetPositions[i];
      if (!targetPos) return;

      orders.push({
        id: unit.id,
        type: OrderType.Run,
        path: [targetPos.toArray()],
        rotation: direction.angle(),
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
}
