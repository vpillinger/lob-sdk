"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TakenFire = void 0;
const base_unit_effect_1 = require("./base-unit-effect");
const unit_effect_registry_1 = require("./unit-effect-registry");
const game_data_manager_1 = require("@lob-sdk/game-data-manager");
/**
 * Effect applied when a unit has taken fire from enemies.
 * Affects charge resistance and other combat behaviors.
 */
class TakenFire extends base_unit_effect_1.BaseUnitEffect {
    static id = 5;
    static name = "taken_fire";
    reorgDebuff;
    constructor(duration, reorgDebuff) {
        super(duration);
        this.reorgDebuff = reorgDebuff;
    }
    onAdded(unit) {
        unit.reorgDebuff = Math.max(unit.reorgDebuff, this.reorgDebuff);
    }
    onTickStart(unit) {
        unit.reorgDebuff = Math.max(unit.reorgDebuff, this.reorgDebuff);
    }
    merge(other) {
        // Prioritize effects with more reorg debuff
        if (other.reorgDebuff >= this.reorgDebuff) {
            this.duration = other.duration;
            this.reorgDebuff = other.reorgDebuff;
        }
    }
    toDto() {
        return [this.id, this.duration, this.reorgDebuff];
    }
    getDisplayStats(unit) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(unit.era);
        const { HAS_TAKEN_FIRE_SPEED_MODIFIER } = gameDataManager.getGameConstants();
        return [
            {
                label: "movement",
                type: "percentage",
                value: HAS_TAKEN_FIRE_SPEED_MODIFIER,
                color: HAS_TAKEN_FIRE_SPEED_MODIFIER < 0 ? "red" : "green",
            },
            {
                label: "reorgDebuff",
                type: "percentage",
                signed: true,
                value: this.reorgDebuff,
                color: this.reorgDebuff > 0 ? "red" : "green",
            },
        ];
    }
}
exports.TakenFire = TakenFire;
// Auto-register when module is loaded
unit_effect_registry_1.UnitEffectRegistry.register(TakenFire);
