"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashPair = void 0;
class HashPair {
    pairs = new Set();
    constructor(pairs = []) {
        pairs.forEach(([item1, item2]) => this.addPair(item1, item2));
    }
    hashPair(item1, item2) {
        // Ensure consistent ordering for bidirectional pairs
        const [smaller, larger] = item1 < item2 ? [item1, item2] : [item2, item1];
        return `${smaller}:${larger}`;
    }
    addPair(item1, item2) {
        if (item1 === item2)
            return; // Skip self-pairs
        this.pairs.add(this.hashPair(item1, item2));
    }
    removePair(item1, item2) {
        this.pairs.delete(this.hashPair(item1, item2));
    }
    hasPair(item1, item2) {
        return this.pairs.has(this.hashPair(item1, item2));
    }
    getAllPairs() {
        return Array.from(this.pairs).map(pair => {
            const [item1, item2] = pair.split(':').map(Number);
            return [item1, item2];
        });
    }
    clear() {
        this.pairs.clear();
    }
    get size() {
        return this.pairs.size;
    }
    isEmpty() {
        return this.pairs.size === 0;
    }
}
exports.HashPair = HashPair;
