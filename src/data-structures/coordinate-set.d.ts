export declare class CoordinateSet {
    private coordinates;
    constructor(coordinates?: [number, number][]);
    private hashCoordinate;
    add(x: number, y: number): void;
    remove(x: number, y: number): void;
    has(x: number, y: number): boolean;
    getAllCoordinates(): [number, number][];
    clear(): void;
    get size(): number;
    isEmpty(): boolean;
    [Symbol.iterator](): Iterator<[number, number]>;
}
