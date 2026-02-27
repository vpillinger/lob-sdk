"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartedRouting = void 0;
const base_unit_effect_1 = require("./base-unit-effect");
const unit_effect_registry_1 = require("./unit-effect-registry");
const game_data_manager_1 = require("@lob-sdk/game-data-manager");
/**
 * Effect applied when a unit has started routing.
 * Used to track units that have recently begun routing and affects recovery behavior.
 */
class StartedRouting extends base_unit_effect_1.BaseUnitEffect {
    static id = 4;
    static name = "started_routing";
    merge(other) {
        if (other.duration > this.duration) {
            this.duration = other.duration;
        }
    }
    getDisplayStats(unit) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(unit.era);
        const { organization } = gameDataManager.getGameRules();
        return [
            {
                label: "unitStat.orgRadiusBonus",
                type: "percentage",
                value: organization.startedRoutingOrgRadiusModifier,
                color: organization.startedRoutingOrgRadiusModifier < 0 ? "red" : "green",
            },
            {
                label: "unitStat.orgRadiusBonus",
                type: "text",
                value: -5, // todo make configurable
                color: "red",
            },
            {
                label: "unitStat.orgRadius",
                type: "text",
                value: organization.startedRoutingOrgRadiusDistance,
                color: "red",
            },
            {
                label: "unitStat.movement",
                type: "percentage",
                value: organization.startedRoutingOrgRadiusDistanceRunSpeedBonus,
                color: "green",
            },
            {
                label: "unitStat.runCost",
                type: "percentage",
                value: organization.startedRoutingRunCostModifier,
                color: "red",
            },
        ];
    }
    getOrgRadiusValue(unit) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(unit.era);
        const { organization } = gameDataManager.getGameRules();
        return organization.startedRoutingOrgRadiusDistance;
    }
}
exports.StartedRouting = StartedRouting;
// Auto-register when module is loaded
unit_effect_registry_1.UnitEffectRegistry.register(StartedRouting);
