"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rotated180 = void 0;
const base_unit_effect_1 = require("./base-unit-effect");
const unit_effect_registry_1 = require("./unit-effect-registry");
/**
 * Effect that causes a unit to fully stop when rotating 180 degrees.
 * Duration is typically set to the unit's turningDelay property.
 */
class Rotated180 extends base_unit_effect_1.BaseUnitEffect {
    static id = 1;
    static name = "rotated_180";
    getDisplayStats(unit) {
        return [
            {
                label: "cannotMove",
                type: "text",
                color: "red",
            },
        ];
    }
}
exports.Rotated180 = Rotated180;
// Auto-register when module is loaded
unit_effect_registry_1.UnitEffectRegistry.register(Rotated180);
