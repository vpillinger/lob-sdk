import { AnyOrder, IServerGame, OrderType } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { NapoleonicBotStrategy, NapoleonicBotStrategyContext } from "../types";
import { calculateFlankPositions, splitCavalry } from "../formation-utils";

/**
 * Strategy for cavalry: flank protection.
 */
export class CavalryStrategy implements NapoleonicBotStrategy {
  assignOrders(
    units: BaseUnit[],
    game: IServerGame,
    visibleEnemies: BaseUnit[],
    orders: AnyOrder[],
    context: NapoleonicBotStrategyContext,
  ): void {
    const { formationCenter, direction, perpendicular, lineSpacing, unitSpacing, mainBodyWidth } = context;

    const cavalrySplit = splitCavalry(units);
    
    // Left Flank
    const leftPositions = calculateFlankPositions(
      cavalrySplit.left,
      formationCenter,
      direction,
      perpendicular,
      -mainBodyWidth / 2 - unitSpacing,
      lineSpacing,
      game
    );

    cavalrySplit.left.forEach((unit, i) => {
      const targetPos = leftPositions[i];
      if (!targetPos) return;
      orders.push({
        id: unit.id,
        type: OrderType.Walk,
        path: [targetPos.toArray()],
        rotation: direction.angle(),
      });
    });

    // Right Flank
    const rightPositions = calculateFlankPositions(
      cavalrySplit.right,
      formationCenter,
      direction,
      perpendicular,
      mainBodyWidth / 2 + unitSpacing,
      lineSpacing,
      game
    );

    cavalrySplit.right.forEach((unit, i) => {
      const targetPos = rightPositions[i];
      if (!targetPos) return;
      orders.push({
        id: unit.id,
        type: OrderType.Walk,
        path: [targetPos.toArray()],
        rotation: direction.angle(),
      });
    });
  }
}
