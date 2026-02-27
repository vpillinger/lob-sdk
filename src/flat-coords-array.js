"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatCoordsArray = void 0;
/**
 * Option 2: Flat Array Implementation
 * - Fastest iteration speed
 * - Best memory efficiency for dense coordinates
 * - O(n) lookup time but very cache-friendly
 */
class FlatCoordsArray {
    xs = [];
    ys = [];
    add(x, y) {
        // Linear search - can be optimized with binary search if kept sorted
        for (let i = 0; i < this.xs.length; i++) {
            if (this.xs[i] === x && this.ys[i] === y) {
                return false;
            }
        }
        this.xs.push(x);
        this.ys.push(y);
        return true;
    }
    has(x, y) {
        for (let i = 0; i < this.xs.length; i++) {
            if (this.xs[i] === x && this.ys[i] === y) {
                return true;
            }
        }
        return false;
    }
    delete(x, y) {
        for (let i = 0; i < this.xs.length; i++) {
            if (this.xs[i] === x && this.ys[i] === y) {
                // Fast delete by swapping with last element
                const lastIndex = this.xs.length - 1;
                if (i !== lastIndex) {
                    this.xs[i] = this.xs[lastIndex];
                    this.ys[i] = this.ys[lastIndex];
                }
                this.xs.pop();
                this.ys.pop();
                return true;
            }
        }
        return false;
    }
    get size() {
        return this.xs.length;
    }
    // Ultra-fast iteration (no object creation)
    forEach(callback) {
        for (let i = 0; i < this.xs.length; i++) {
            callback(this.xs[i], this.ys[i]);
        }
    }
    // Zero-allocation iteration with reusable pair
    forEachFast(callback) {
        const pair = [0, 0];
        for (let i = 0; i < this.xs.length; i++) {
            pair[0] = this.xs[i];
            pair[1] = this.ys[i];
            callback(pair);
        }
    }
    *[Symbol.iterator]() {
        for (let i = 0; i < this.xs.length; i++) {
            yield [this.xs[i], this.ys[i]];
        }
    }
    some(predicate) {
        for (let i = 0; i < this.xs.length; i++) {
            if (predicate(this.xs[i], this.ys[i])) {
                return true;
            }
        }
        return false;
    }
    every(predicate) {
        for (let i = 0; i < this.xs.length; i++) {
            if (!predicate(this.xs[i], this.ys[i])) {
                return false;
            }
        }
        return true;
    }
    toArray() {
        const result = new Array(this.xs.length);
        for (let i = 0; i < this.xs.length; i++) {
            result[i] = [this.xs[i], this.ys[i]];
        }
        return result;
    }
    clear() {
        this.xs.length = 0;
        this.ys.length = 0;
    }
    isEmpty() {
        return this.xs.length === 0;
    }
}
exports.FlatCoordsArray = FlatCoordsArray;
