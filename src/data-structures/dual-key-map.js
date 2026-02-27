"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualKeyMap = void 0;
class DualKeyMap {
    map = new Map();
    set(key1, key2, value) {
        let inner = this.map.get(key1);
        if (!inner) {
            inner = new Map();
            this.map.set(key1, inner);
        }
        inner.set(key2, value);
    }
    get(key1, key2) {
        return this.map.get(key1)?.get(key2);
    }
    has(key1, key2) {
        return this.map.get(key1)?.has(key2) ?? false;
    }
    delete(key1, key2) {
        const inner = this.map.get(key1);
        if (!inner)
            return false;
        const deleted = inner.delete(key2);
        if (inner.size === 0) {
            this.map.delete(key1);
        }
        return deleted;
    }
    /** Delete all entries with a specific key1 */
    deleteAll(key1) {
        return this.map.delete(key1);
    }
    /** Iterate over all entries */
    *entries() {
        for (const [k1, inner] of this.map) {
            for (const [k2, v] of inner) {
                yield [k1, k2, v];
            }
        }
    }
    clear() {
        this.map.clear();
    }
    get size() {
        return this.map.size;
    }
}
exports.DualKeyMap = DualKeyMap;
