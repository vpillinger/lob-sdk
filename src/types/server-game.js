"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Direction = exports.GameEndReason = exports.TurnStatus = void 0;
/**
 * Status of a game turn.
 */
var TurnStatus;
(function (TurnStatus) {
    /** Turn is currently in progress. */
    TurnStatus["InProgress"] = "IN_PROGRESS";
    /** Turn has been completed. */
    TurnStatus["Completed"] = "COMPLETED";
    /** Turn has timed out. */
    TurnStatus["TimedOut"] = "TIMED_OUT";
})(TurnStatus || (exports.TurnStatus = TurnStatus = {}));
/**
 * Reason why a game ended.
 */
var GameEndReason;
(function (GameEndReason) {
    /** Game ended due to victory conditions. */
    GameEndReason["Victory"] = "victory";
    /** Game ended because maximum turn limit was reached. */
    GameEndReason["MaxTurn"] = "max_turn";
    /** Game was cancelled. */
    GameEndReason["Cancelled"] = "cancelled";
    /** Game ended in a draw by agreement. */
    GameEndReason["DrawByAgreement"] = "draw_by_agreement";
})(GameEndReason || (exports.GameEndReason = GameEndReason = {}));
/**
 * Direction relative to a unit's facing.
 */
var Direction;
(function (Direction) {
    /** Front of the unit. */
    Direction[Direction["Front"] = 0] = "Front";
    /** Right side of the unit. */
    Direction[Direction["Right"] = 1] = "Right";
    /** Back of the unit. */
    Direction[Direction["Back"] = 2] = "Back";
    /** Left side of the unit. */
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (exports.Direction = Direction = {}));
