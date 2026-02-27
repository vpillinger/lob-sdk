import { UnitFormationTemplate, UnitTemplate, UnitType } from "@lob-sdk/types";
/**
 * Manages unit templates and their formations.
 * Provides efficient lookup of unit templates and formation configurations.
 */
export declare class UnitTemplateManager {
    private _templates;
    private _map;
    private _formations;
    /**
     * Loads unit templates into the manager.
     * @param templates - An array of unit templates to load.
     */
    load(templates: UnitTemplate[]): void;
    /**
     * Gets a unit template by type.
     * @param type - The unit type ID.
     * @returns The unit template.
     * @throws Error if the template is not found.
     * @template T - The specific unit template type to return.
     */
    getTemplate<T extends UnitTemplate = UnitTemplate>(type: UnitType): T;
    /**
     * Gets all unit templates.
     * @returns An array of all unit templates.
     */
    getTemplates(): UnitTemplate[];
    /**
     * Gets a formation template for a specific unit type and formation ID.
     * @param type - The unit type ID.
     * @param formationId - The formation ID.
     * @returns The formation template, or null if not found.
     */
    getFormation(type: UnitType, formationId: string): UnitFormationTemplate | null;
    /**
     * Gets the default formation for a unit type.
     * @param type - The unit type ID.
     * @returns The default formation template.
     */
    getDefaultFormation(type: UnitType): UnitFormationTemplate;
    /**
     * Gets all available formations for a unit type.
     * @param unitType - The unit type ID.
     * @returns An array of available formation templates.
     */
    getAvailableFormations(unitType: UnitType): UnitFormationTemplate[];
}
