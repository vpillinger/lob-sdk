export declare class HashPair<T = number> {
    private pairs;
    constructor(pairs?: [T, T][]);
    private hashPair;
    addPair(item1: T, item2: T): void;
    removePair(item1: T, item2: T): void;
    hasPair(item1: T, item2: T): boolean;
    getAllPairs(): [T, T][];
    clear(): void;
    get size(): number;
    isEmpty(): boolean;
}
