import { AnyOrder, IServerGame, OrderType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext } from "../types";
import { calculateLinePositions, splitIntoLines } from "../formation-utils";

/**
 * Strategy for infantry: multi-line formations.
 */
export class InfantryStrategy implements NapoleonicBotStrategy {
  assignOrders(
    units: BaseUnit[],
    game: IServerGame,
    visibleEnemies: BaseUnit[],
    orders: AnyOrder[],
    context: NapoleonicBotStrategyContext,
  ): void {
    const { formationCenter, direction, perpendicular, unitSpacing, lineSpacing } = context;

    const infantryLines = splitIntoLines(units, 10); // Max 10 units per line
    infantryLines.forEach((line, index) => {
      const targetPositions = calculateLinePositions(
        line,
        formationCenter,
        direction,
        perpendicular,
        -lineSpacing * (index + 2), // Behind artillery
        unitSpacing,
        game,
      );

      line.forEach((unit, i) => {
        const targetPos = targetPositions[i];
        if (!targetPos) return;

        orders.push({
          id: unit.id,
          type: OrderType.Walk,
          path: [targetPos.toArray()],
          rotation: direction.angle(),
        });
      });
    });
  }
}
