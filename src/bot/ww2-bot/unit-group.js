"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitGroup = void 0;
const utils_1 = require("@lob-sdk/utils");
const vector_1 = require("@lob-sdk/vector");
/**
 * Represents a group of units that belong to the same category and are typically positioned near each other.
 * Used by bot AI for grouping units and making strategic decisions.
 * @template T - The type of unit, must extend BaseUnit.
 */
class UnitGroup {
    units;
    category;
    /** Cached center position of the group. */
    cachedCenter = null;
    /** The player number that owns all units in this group. */
    player;
    /**
     * Creates a new UnitGroup instance.
     * @param units - An array of units to include in the group.
     * @param category - The unit category ID that all units in this group belong to.
     */
    constructor(units, category) {
        this.units = units;
        this.category = category;
        this.player = units[0].player;
    }
    /**
     * Gets the center position of the group, calculated as the median point of all unit positions.
     * The result is cached for performance.
     * @returns The center position as a Vector2.
     */
    getCenter() {
        if (!this.cachedCenter) {
            const median = (0, utils_1.medianPoint)(this.units.map((unit) => unit.position));
            this.cachedCenter = new vector_1.Vector2(median.x, median.y);
        }
        return this.cachedCenter;
    }
    /**
     * Adds a unit to the group and invalidates the cached center.
     * @param unit - The unit to add.
     */
    addUnit(unit) {
        this.units.push(unit);
        this.cachedCenter = null;
    }
    /**
     * Gets the number of units in the group.
     * @returns The size of the group.
     */
    get size() {
        return this.units.length;
    }
}
exports.UnitGroup = UnitGroup;
