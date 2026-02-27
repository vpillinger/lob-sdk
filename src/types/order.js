"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderType = void 0;
/**
 * Type of order that can be given to a unit.
 */
var OrderType;
(function (OrderType) {
    /** Order to walk along a path. */
    OrderType[OrderType["Walk"] = 1] = "Walk";
    /** Order to run along a path. */
    OrderType[OrderType["Run"] = 2] = "Run";
    /** Order to shoot at a target or location. */
    OrderType[OrderType["Shoot"] = 3] = "Shoot";
    /** Order to fire while advancing. */
    OrderType[OrderType["FireAndAdvance"] = 4] = "FireAndAdvance";
    /** Order to place an entity at a location. */
    OrderType[OrderType["PlaceEntity"] = 5] = "PlaceEntity";
    /** Order to fall back along a path. */
    OrderType[OrderType["Fallback"] = 6] = "Fallback";
    /** Order to rotate toward a target or location. */
    OrderType[OrderType["Rotate"] = 7] = "Rotate";
})(OrderType || (exports.OrderType = OrderType = {}));
