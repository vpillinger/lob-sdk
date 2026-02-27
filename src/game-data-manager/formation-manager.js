"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormationManager = void 0;
/**
 * Handles formations and friendly fire immune damage types.
 * Manages formation templates and tracks which damage types are immune to friendly fire for each formation.
 */
class FormationManager {
    _formationMap = new Map();
    _friendlyFireImmuneDamageTypes = new Map();
    /**
     * Creates a new FormationManager instance.
     */
    constructor() { }
    /**
     * Loads formation templates into the manager.
     * @param _templates - An array of formation templates to load.
     */
    load(_templates) {
        for (const formation of _templates) {
            this._formationMap.set(formation.id, formation);
            if (formation.friendlyFireImmuneDamageTypes !== undefined &&
                formation.friendlyFireImmuneDamageTypes.length > 0) {
                this._friendlyFireImmuneDamageTypes.set(formation.id, new Set(formation.friendlyFireImmuneDamageTypes));
            }
        }
    }
    /**
     * Gets a formation template by ID.
     * @param id - The formation ID.
     * @returns The formation template, or null if not found.
     */
    getTemplate(id) {
        return this._formationMap.get(id) ?? null;
    }
    /**
     * Checks if a damage type is immune to friendly fire for a given formation.
     * @param id - The formation ID.
     * @param damageType - The damage type name to check.
     * @returns True if the damage type is immune to friendly fire for this formation, false otherwise.
     */
    isFriendlyFireImmune(id, damageType) {
        return (this._friendlyFireImmuneDamageTypes.get(id)?.has(damageType) ?? false);
    }
}
exports.FormationManager = FormationManager;
