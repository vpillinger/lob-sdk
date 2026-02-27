"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitTemplateManager = void 0;
/**
 * Manages unit templates and their formations.
 * Provides efficient lookup of unit templates and formation configurations.
 */
class UnitTemplateManager {
    _templates = [];
    _map = new Map();
    _formations = new Map();
    /**
     * Loads unit templates into the manager.
     * @param templates - An array of unit templates to load.
     */
    load(templates) {
        this._templates = templates;
        for (const template of templates) {
            this._map.set(template.type, template);
            const formationMap = new Map();
            for (const formation of template.formations) {
                formationMap.set(formation.id, formation);
            }
            this._formations.set(template.type, formationMap);
        }
    }
    /**
     * Gets a unit template by type.
     * @param type - The unit type ID.
     * @returns The unit template.
     * @throws Error if the template is not found.
     * @template T - The specific unit template type to return.
     */
    getTemplate(type) {
        const template = this._map.get(type);
        if (!template) {
            throw new Error(`Unit template with type ${type} not found`);
        }
        return template;
    }
    /**
     * Gets all unit templates.
     * @returns An array of all unit templates.
     */
    getTemplates() {
        return this._templates;
    }
    /**
     * Gets a formation template for a specific unit type and formation ID.
     * @param type - The unit type ID.
     * @param formationId - The formation ID.
     * @returns The formation template, or null if not found.
     */
    getFormation(type, formationId) {
        return this._formations.get(type)?.get(formationId) ?? null;
    }
    /**
     * Gets the default formation for a unit type.
     * @param type - The unit type ID.
     * @returns The default formation template.
     */
    getDefaultFormation(type) {
        const template = this.getTemplate(type);
        return this.getFormation(type, template.defaultFormation);
    }
    /**
     * Gets all available formations for a unit type.
     * @param unitType - The unit type ID.
     * @returns An array of available formation templates.
     */
    getAvailableFormations(unitType) {
        const template = this.getTemplate(unitType);
        return template.formations;
    }
}
exports.UnitTemplateManager = UnitTemplateManager;
