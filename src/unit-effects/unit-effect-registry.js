"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitEffectRegistry = void 0;
/**
 * Registry that maps effect IDs to their string names and vice versa.
 * This allows templates to reference effects by name while keeping DTOs compact with numeric IDs.
 */
class UnitEffectRegistry {
    static _idToName = new Map();
    static _nameToId = new Map();
    static _idToClass = new Map();
    /**
     * Registers an effect class with its ID and name.
     * Should be called automatically when effect classes are loaded.
     * @throws Error if the ID or name is already registered by another effect.
     */
    static register(effectClass) {
        const id = effectClass.id;
        const effectName = effectClass.name; // The effect's string name (e.g., "has_fired")
        // Check for duplicate ID
        if (this._idToName.has(id)) {
            const existingEffectName = this._idToName.get(id);
            throw new Error(`Cannot register effect with ID ${id} and name "${effectName}": ` +
                `Effect ID ${id} is already registered to name "${existingEffectName}"`);
        }
        // Check for duplicate name
        if (this._nameToId.has(effectName)) {
            const existingId = this._nameToId.get(effectName);
            throw new Error(`Cannot register effect with ID ${id} and name "${effectName}": ` +
                `Effect name "${effectName}" is already registered to ID ${existingId}`);
        }
        this._idToName.set(id, effectName);
        this._nameToId.set(effectName, id);
        this._idToClass.set(id, effectClass);
    }
    /**
     * Gets the string name for an effect ID.
     * @param id - The numeric effect ID
     * @returns The effect name, or undefined if not found
     */
    static getName(id) {
        return this._idToName.get(id);
    }
    /**
     * Gets the numeric ID for an effect name.
     * @param name - The string effect name
     * @returns The effect ID, or undefined if not found
     */
    static getId(name) {
        return this._nameToId.get(name);
    }
    /**
     * Gets the effect class for an effect ID.
     * @param id - The numeric effect ID
     * @returns The effect class, or undefined if not found
     */
    static getEffectClass(id) {
        return this._idToClass.get(id);
    }
    /**
     * Converts an effect name (string) to its numeric ID.
     * Useful for parsing templates that use string names.
     * @param name - The effect name
     * @returns The numeric ID
     * @throws Error if the name is not registered
     */
    static nameToIdOrThrow(name) {
        const id = this.getId(name);
        if (id === undefined) {
            throw new Error(`Unknown effect name: "${name}"`);
        }
        return id;
    }
    /**
     * Converts an effect ID (number) to its string name.
     * @param id - The numeric effect ID
     * @returns The effect name
     * @throws Error if the ID is not registered
     */
    static idToNameOrThrow(id) {
        const name = this.getName(id);
        if (name === undefined) {
            throw new Error(`Unknown effect ID: ${id}`);
        }
        return name;
    }
    /**
     * Gets all registered effect names.
     * @returns Array of all registered effect names
     */
    static getAllNames() {
        return Array.from(this._nameToId.keys());
    }
    /**
     * Gets all registered effect IDs.
     * @returns Array of all registered effect IDs
     */
    static getAllIds() {
        return Array.from(this._idToName.keys());
    }
    /**
     * Creates a unit effect instance from a DTO.
     * @param dto - The effect DTO containing [id, duration, ...args]
     * @returns A new instance of the effect
     * @throws Error if the effect ID is not registered
     */
    static create(dto) {
        const [effectId, ...args] = dto;
        const effectClass = this.getEffectClass(effectId);
        if (!effectClass) {
            throw new Error(`Unknown unit effect: ${effectId}`);
        }
        return Reflect.construct(effectClass, args);
    }
    /**
     * Creates a unit effect instance from a name, duration, and optional args.
     * @param name - The effect name (e.g., "has_ran")
     * @param duration - The effect duration in ticks
     * @param args - Optional additional arguments for the effect
     * @returns A new instance of the effect
     * @throws Error if the effect name is not registered
     */
    static createFromName(name, duration, args = []) {
        const effectId = this.nameToIdOrThrow(name);
        const effectClass = this.getEffectClass(effectId);
        if (!effectClass) {
            throw new Error(`Unknown unit effect: ${effectId}`);
        }
        return new effectClass(duration, ...args);
    }
}
exports.UnitEffectRegistry = UnitEffectRegistry;
