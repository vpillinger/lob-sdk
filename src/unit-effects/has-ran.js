"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasRan = void 0;
const base_unit_effect_1 = require("./base-unit-effect");
const unit_effect_registry_1 = require("./unit-effect-registry");
const game_data_manager_1 = require("@lob-sdk/game-data-manager");
/**
 * Effect applied when a unit has been running.
 * Used to track recent running movement and affects various unit behaviors.
 */
class HasRan extends base_unit_effect_1.BaseUnitEffect {
    static id = 3;
    static name = "has_ran";
    getDisplayStats(unit) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(unit.era);
        const { stamina } = gameDataManager.getGameRules();
        const stats = [
            {
                label: "unitStat.chargeResistance",
                type: "percentage",
                signed: true,
                value: unit.runChargeResistanceModifier,
                color: unit.runChargeResistanceModifier > 0 ? "red" : "green",
            },
        ];
        if (stamina) {
            stats.push({
                label: "meleeStaminaCost",
                type: "percentage",
                signed: true,
                value: stamina.hasRanMeleeStaminaCostModifier,
                color: stamina.hasRanMeleeStaminaCostModifier > 0 ? "red" : "green",
            });
        }
        return stats;
    }
}
exports.HasRan = HasRan;
// Auto-register when module is loaded
unit_effect_registry_1.UnitEffectRegistry.register(HasRan);
