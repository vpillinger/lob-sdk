import { UnitCategoryId } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { Vector2 } from "@lob-sdk/vector";
/**
 * Represents a group of units that belong to the same category and are typically positioned near each other.
 * Used by bot AI for grouping units and making strategic decisions.
 * @template T - The type of unit, must extend BaseUnit.
 */
export declare class UnitGroup<T extends BaseUnit = BaseUnit> {
    units: T[];
    category: UnitCategoryId;
    /** Cached center position of the group. */
    cachedCenter: Vector2 | null;
    /** The player number that owns all units in this group. */
    player: number;
    /**
     * Creates a new UnitGroup instance.
     * @param units - An array of units to include in the group.
     * @param category - The unit category ID that all units in this group belong to.
     */
    constructor(units: T[], category: UnitCategoryId);
    /**
     * Gets the center position of the group, calculated as the median point of all unit positions.
     * The result is cached for performance.
     * @returns The center position as a Vector2.
     */
    getCenter(): Vector2;
    /**
     * Adds a unit to the group and invalidates the cached center.
     * @param unit - The unit to add.
     */
    addUnit(unit: T): void;
    /**
     * Gets the number of units in the group.
     * @returns The size of the group.
     */
    get size(): number;
}
