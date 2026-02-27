"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionType = void 0;
/**
 * Type of action that occurred during game execution.
 */
var ActionType;
(function (ActionType) {
    /** Container action containing all actions for a game tick. */
    ActionType[ActionType["TickAction"] = 1] = "TickAction";
    /** Unit movement action. */
    ActionType[ActionType["Move"] = 2] = "Move";
    /** Unit rotation action. */
    ActionType[ActionType["Rotate"] = 3] = "Rotate";
    /** Melee attack action. */
    ActionType[ActionType["Attack"] = 4] = "Attack";
    /** Ranged attack action. */
    ActionType[ActionType["RangedAttack"] = 5] = "RangedAttack";
    /** Action adding units to the game. */
    ActionType[ActionType["AddUnits"] = 6] = "AddUnits";
    /** Action when a unit is destroyed. */
    ActionType[ActionType["UnitDestroyed"] = 7] = "UnitDestroyed";
    /** Action updating a unit's state. */
    ActionType[ActionType["UpdateUnitState"] = 8] = "UpdateUnitState";
    /** Action placing an entity on the map. */
    ActionType[ActionType["PlaceEntity"] = 9] = "PlaceEntity";
    /** Action updating an objective's state. */
    ActionType[ActionType["UpdateObjectiveState"] = 10] = "UpdateObjectiveState";
    /** Action marking the start of a new turn. */
    ActionType[ActionType["TurnAction"] = 11] = "TurnAction";
    /** Action adding objectives to the game. */
    ActionType[ActionType["AddObjectives"] = 12] = "AddObjectives";
    /** Action changing a unit's formation. */
    ActionType[ActionType["FormationChange"] = 13] = "FormationChange";
})(ActionType || (exports.ActionType = ActionType = {}));
