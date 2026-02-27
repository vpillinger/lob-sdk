import { Vector2 } from "./vector2";
/**
 * A set data structure for Vector2 instances that uses string-based keys for efficient lookups.
 * Duplicate vectors (with the same x, y coordinates) are automatically deduplicated.
 */
export declare class Vector2Set {
    private map;
    /**
     * Creates a new empty Vector2Set.
     */
    constructor();
    /**
     * Adds a vector to the set. If a vector with the same coordinates already exists, it will be replaced.
     * @param vector - The vector to add.
     */
    add(vector: Vector2): void;
    /**
     * Checks if a vector exists in the set.
     * @param vector - The vector to check.
     * @returns True if the vector exists in the set, false otherwise.
     */
    has(vector: Vector2): boolean;
    /**
     * Creates a new set containing only vectors that pass the filter function.
     * @param filterFunction - A function that returns true for vectors to include.
     * @returns A new Vector2Set containing the filtered vectors.
     */
    filter(filterFunction: (value: Vector2) => boolean): Vector2Set;
    /**
     * Removes all vectors from the set.
     */
    clear(): void;
    /**
     * Returns an iterator over the values in the set.
     * @returns An iterator of Vector2 instances.
     */
    values(): MapIterator<Vector2>;
    /**
     * Converts the set to an array of vectors.
     * @returns An array containing all vectors in the set.
     */
    toArray(): Vector2[];
}
