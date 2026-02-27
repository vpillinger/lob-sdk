"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameClientEventType = exports.GameTriggerActionType = exports.GameTriggerConditionType = exports.GameTriggerEventType = void 0;
/**
 * Type of event that can trigger game triggers.
 */
var GameTriggerEventType;
(function (GameTriggerEventType) {
    /** Trigger fires at the start of a turn. */
    GameTriggerEventType["OnTurnStart"] = "onTurnStart";
    /** Trigger fires at the end of a turn. */
    GameTriggerEventType["OnTurnEnd"] = "onTurnEnd";
})(GameTriggerEventType || (exports.GameTriggerEventType = GameTriggerEventType = {}));
/**
 * Type of condition that can be checked in a game trigger.
 */
var GameTriggerConditionType;
(function (GameTriggerConditionType) {
    /** Check if current turn equals a specific value. */
    GameTriggerConditionType["IsTurn"] = "isTurn";
    /** Check if current turn is a multiple of a value (with optional offset). */
    GameTriggerConditionType["IsTurnMultipleOf"] = "isTurnMultipleOf";
    /** Check if current turn is greater than a value. */
    GameTriggerConditionType["IsTurnGreaterThan"] = "isTurnGreaterThan";
    /** Check if current turn is less than a value. */
    GameTriggerConditionType["IsTurnLessThan"] = "isTurnLessThan";
    /** Check if an objective belongs to a specific player or team. */
    GameTriggerConditionType["ObjectiveBelongsTo"] = "objectiveBelongsTo";
    /** Check if a unit is not alive (destroyed). */
    GameTriggerConditionType["IsUnitNotAlive"] = "isUnitNotAlive";
    /** Check if a unit is routing. */
    GameTriggerConditionType["IsUnitRouting"] = "isUnitRouting";
    /** Check if a unit moved this turn. */
    GameTriggerConditionType["UnitMovedThisTurn"] = "unitMovedThisTurn";
    /** Random chance condition (0-1 probability). */
    GameTriggerConditionType["Chance"] = "chance";
    /** Check if a game variable has a specific value. */
    GameTriggerConditionType["IsVar"] = "isVar";
})(GameTriggerConditionType || (exports.GameTriggerConditionType = GameTriggerConditionType = {}));
/**
 * Type of action that can be executed by a game trigger.
 */
var GameTriggerActionType;
(function (GameTriggerActionType) {
    /** Action to add units to the game. */
    GameTriggerActionType["AddUnit"] = "addUnit";
    /** Action to remove units from the game. */
    GameTriggerActionType["RemoveUnit"] = "removeUnit";
    /** Action to add new triggers to the game. */
    GameTriggerActionType["AddTrigger"] = "addTrigger";
    /** Action to show a message to players. */
    GameTriggerActionType["ShowMessage"] = "showMessage";
    /** Action to defeat a player. */
    GameTriggerActionType["DefeatPlayer"] = "defeatPlayer";
    /** Action to move the camera. */
    GameTriggerActionType["MoveCamera"] = "moveCamera";
    /** Action to spawn neutral objectives. */
    GameTriggerActionType["SpawnNeutralObjectives"] = "spawnNeutralObjectives";
    /** Action to set a game variable. */
    GameTriggerActionType["SetVar"] = "setVar";
    /** Action to end the game. */
    GameTriggerActionType["EndGame"] = "endGame";
    /** Action to give an order to a unit. */
    GameTriggerActionType["OrderUnit"] = "orderUnit";
})(GameTriggerActionType || (exports.GameTriggerActionType = GameTriggerActionType = {}));
/**
 * Type of client event that can be sent to players.
 */
var GameClientEventType;
(function (GameClientEventType) {
    /** Message event to display to players. */
    GameClientEventType["Message"] = "message";
    /** Camera movement event. */
    GameClientEventType["MoveCamera"] = "moveCamera";
})(GameClientEventType || (exports.GameClientEventType = GameClientEventType = {}));
