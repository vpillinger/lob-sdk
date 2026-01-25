import { AnyOrder, IServerGame, OrderType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext } from "../types";
import { calculateLinePositions } from "../formation-utils";

/**
 * Strategy for artillery: always run to position.
 */
export class ArtilleryStrategy implements NapoleonicBotStrategy {
  assignOrders(
    units: BaseUnit[],
    game: IServerGame,
    visibleEnemies: BaseUnit[],
    orders: AnyOrder[],
    context: NapoleonicBotStrategyContext,
  ): void {
    const { formationCenter, direction, perpendicular, unitSpacing, lineSpacing } = context;

    const targetPositions = calculateLinePositions(
      units,
      formationCenter,
      direction,
      perpendicular,
      -lineSpacing, // Second line (behind skirmishers)
      unitSpacing * 1.5,
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
    });
  }
}
