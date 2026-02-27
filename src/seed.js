"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSeeded = void 0;
exports.generateRandomSeed = generateRandomSeed;
exports.deriveSeed = deriveSeed;
class Xorshift32 {
    seed;
    constructor(seed) {
        this.seed = seed >>> 0;
    }
    next() {
        let x = this.seed;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.seed = x >>> 0;
        return this.seed;
    }
    random() {
        return this.next() / 0x100000000;
    }
}
const randomSeeded = (seed) => {
    const xorshift = new Xorshift32(seed);
    return () => xorshift.random();
};
exports.randomSeeded = randomSeeded;
function generateRandomSeed() {
    const maxSeedValue = 0xffffffff; // 32-bit unsigned integer maximum value
    return Math.floor(Math.random() * maxSeedValue);
}
function deriveSeed(baseSeed, index) {
    const xorshift = new Xorshift32(baseSeed);
    // Advance the generator 'index' times to get the derived seed
    for (let i = 0; i < index; i++) {
        xorshift.random();
    }
    // Return the derived seed
    return Math.floor(xorshift.random() * 0xffffffff); // Adjust the range as needed
}
