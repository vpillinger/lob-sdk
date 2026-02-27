"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeenInMelee = void 0;
const base_unit_effect_1 = require("./base-unit-effect");
const unit_effect_registry_1 = require("./unit-effect-registry");
/**
 * Effect applied when a unit has been in melee combat.
 * Used to track recent melee engagement status.
 */
class BeenInMelee extends base_unit_effect_1.BaseUnitEffect {
    static id = 2;
    static name = "been_in_melee";
    reorgDebuff;
    constructor(duration, reorgDebuff) {
        super(duration);
        this.reorgDebuff = reorgDebuff;
    }
    onAdded(unit) {
        unit.cannotChangeFormation = true;
        unit.cannotCharge = true;
        unit.reorgDebuff = Math.max(unit.reorgDebuff, this.reorgDebuff);
    }
    onTickStart(unit) {
        unit.cannotChangeFormation = true;
        unit.cannotCharge = true;
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
        return [
            {
                label: "cannotChangeFormation",
                type: "text",
                color: "red",
            },
            {
                label: "cannotCharge",
                type: "text",
                color: "red",
            },
            {
                label: "reorgDebuff",
                value: this.reorgDebuff,
                type: "percentage",
                signed: true,
                color: this.reorgDebuff > 0 ? "red" : "green",
            },
        ];
    }
}
exports.BeenInMelee = BeenInMelee;
// Auto-register when module is loaded
unit_effect_registry_1.UnitEffectRegistry.register(BeenInMelee);
