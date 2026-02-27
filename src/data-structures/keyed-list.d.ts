/**
 * A data structure that combines a Map and an Array to provide O(1) access by key
 * and O(1) access by index, while maintaining a stable order.
 *
 * Performance:
 * - get(key): O(1)
 * - at(index): O(1)
 * - indexOf(key): O(1)
 * - sync(values, keySelector): O(N)
 */
export declare class KeyedList<K, V> {
    private _order;
    private _map;
    private _indexMap;
    /**
     * Returns the value for a given key in O(1).
     */
    get(key: K): V | undefined;
    /**
     * Returns the value at a given index in O(1).
     */
    at(index: number): V | undefined;
    /**
     * Returns the stable index of a key in O(1).
     */
    indexOf(key: K): number;
    /**
     * Checks if the list of keys has changed compared to a set of potential values.
     */
    hasCompositionChanged<T>(values: T[], keySelector: (val: T) => K): boolean;
    /**
     * Sets the stable order of keys. Clears the current map of values.
     */
    setOrder(keys: K[]): void;
    /**
     * Synchronizes the values in the list with the provided set of new values,
     * maintaining the existing order of keys. Items not in the new values are removed.
     */
    sync<T extends V>(values: T[], keySelector: (val: T) => K): void;
    /**
     * Swaps the positions of two keys in O(1).
     */
    swap(keyA: K, keyB: K): boolean;
    /**
     * Iterates through values in the stable order.
     */
    forEach(callback: (value: V, index: number, key: K) => void): void;
    /**
     * Returns all values in the stable order.
     */
    getValues(): V[];
    get keys(): ReadonlyArray<K>;
    get size(): number;
}
