import { BaseUnitEffect } from "./base-unit-effect";
import { UnitEffectDto } from "@lob-sdk/types";
import { UnitEffectConstructor } from "./types";
/**
 * Registry that maps effect IDs to their string names and vice versa.
 * This allows templates to reference effects by name while keeping DTOs compact with numeric IDs.
 */
export declare class UnitEffectRegistry {
    private static _idToName;
    private static _nameToId;
    private static _idToClass;
    /**
     * Registers an effect class with its ID and name.
     * Should be called automatically when effect classes are loaded.
     * @throws Error if the ID or name is already registered by another effect.
     */
    static register(effectClass: UnitEffectConstructor & {
        id: number;
        name: string;
    }): void;
    /**
     * Gets the string name for an effect ID.
     * @param id - The numeric effect ID
     * @returns The effect name, or undefined if not found
     */
    static getName(id: number): string | undefined;
    /**
     * Gets the numeric ID for an effect name.
     * @param name - The string effect name
     * @returns The effect ID, or undefined if not found
     */
    static getId(name: string): number | undefined;
    /**
     * Gets the effect class for an effect ID.
     * @param id - The numeric effect ID
     * @returns The effect class, or undefined if not found
     */
    static getEffectClass(id: number): UnitEffectConstructor | undefined;
    /**
     * Converts an effect name (string) to its numeric ID.
     * Useful for parsing templates that use string names.
     * @param name - The effect name
     * @returns The numeric ID
     * @throws Error if the name is not registered
     */
    static nameToIdOrThrow(name: string): number;
    /**
     * Converts an effect ID (number) to its string name.
     * @param id - The numeric effect ID
     * @returns The effect name
     * @throws Error if the ID is not registered
     */
    static idToNameOrThrow(id: number): string;
    /**
     * Gets all registered effect names.
     * @returns Array of all registered effect names
     */
    static getAllNames(): string[];
    /**
     * Gets all registered effect IDs.
     * @returns Array of all registered effect IDs
     */
    static getAllIds(): number[];
    /**
     * Creates a unit effect instance from a DTO.
     * @param dto - The effect DTO containing [id, duration, ...args]
     * @returns A new instance of the effect
     * @throws Error if the effect ID is not registered
     */
    static create(dto: UnitEffectDto): BaseUnitEffect;
    /**
     * Creates a unit effect instance from a name, duration, and optional args.
     * @param name - The effect name (e.g., "has_ran")
     * @param duration - The effect duration in ticks
     * @param args - Optional additional arguments for the effect
     * @returns A new instance of the effect
     * @throws Error if the effect name is not registered
     */
    static createFromName(name: string, duration: number, args?: number[]): BaseUnitEffect;
}
