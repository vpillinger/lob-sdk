"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanPassThroughEnemies = void 0;
const base_unit_effect_1 = require("./base-unit-effect");
const unit_effect_registry_1 = require("./unit-effect-registry");
class CanPassThroughEnemies extends base_unit_effect_1.BaseUnitEffect {
    static id = 6;
    static name = "can_pass_through_enemies";
    getDisplayStats(unit) {
        return [
            {
                label: "canPassThroughEnemies",
                type: "text",
                color: "green",
            },
        ];
    }
}
exports.CanPassThroughEnemies = CanPassThroughEnemies;
// Auto-register when module is loaded
unit_effect_registry_1.UnitEffectRegistry.register(CanPassThroughEnemies);
