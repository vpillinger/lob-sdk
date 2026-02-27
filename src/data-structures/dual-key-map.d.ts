export declare class DualKeyMap<K1, K2, V> {
    private map;
    set(key1: K1, key2: K2, value: V): void;
    get(key1: K1, key2: K2): V | undefined;
    has(key1: K1, key2: K2): boolean;
    delete(key1: K1, key2: K2): boolean;
    /** Delete all entries with a specific key1 */
    deleteAll(key1: K1): boolean;
    /** Iterate over all entries */
    entries(): IterableIterator<[K1, K2, V]>;
    clear(): void;
    get size(): number;
}
