/**
 * Option 2: Flat Array Implementation
 * - Fastest iteration speed
 * - Best memory efficiency for dense coordinates
 * - O(n) lookup time but very cache-friendly
 */
export declare class FlatCoordsArray {
    private xs;
    private ys;
    add(x: number, y: number): boolean;
    has(x: number, y: number): boolean;
    delete(x: number, y: number): boolean;
    get size(): number;
    forEach(callback: (x: number, y: number) => void): void;
    forEachFast(callback: (pair: [number, number]) => void): void;
    [Symbol.iterator](): Iterator<[number, number]>;
    some(predicate: (x: number, y: number) => boolean): boolean;
    every(predicate: (x: number, y: number) => boolean): boolean;
    toArray(): [number, number][];
    clear(): void;
    isEmpty(): boolean;
}
