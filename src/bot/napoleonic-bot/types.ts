import { AnyOrder, IServerGame, UnitFormationChange } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { Vector2 } from "@lob-sdk/vector";

/**
 * Interface for Napoleonic unit strategies.
 * Strategies are now responsible for assigning actual orders to a group of units.
 */
export interface NapoleonicBotStrategyContext {
  game: IServerGame;
  visibleEnemies: BaseUnit[];
  orders: AnyOrder[];
  formationChanges: UnitFormationChange[];
  formationCenter: Vector2;
  direction: Vector2;
  perpendicular: Vector2;
  mainBodyWidth: number;
  forwardAngle: number;
}

export interface NapoleonicBotStrategy {
  assignOrders(
    units: BaseUnit[],
    context: NapoleonicBotStrategyContext,
  ): void;
}
