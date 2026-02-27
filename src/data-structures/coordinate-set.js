"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinateSet = void 0;
class CoordinateSet {
    coordinates = new Set();
    constructor(coordinates = []) {
        coordinates.forEach(([x, y]) => this.add(x, y));
    }
    hashCoordinate(x, y) {
        return `${x},${y}`;
    }
    add(x, y) {
        this.coordinates.add(this.hashCoordinate(x, y));
    }
    remove(x, y) {
        this.coordinates.delete(this.hashCoordinate(x, y));
    }
    has(x, y) {
        return this.coordinates.has(this.hashCoordinate(x, y));
    }
    getAllCoordinates() {
        return Array.from(this.coordinates).map(coord => {
            const [x, y] = coord.split(',').map(Number);
            return [x, y];
        });
    }
    clear() {
        this.coordinates.clear();
    }
    get size() {
        return this.coordinates.size;
    }
    isEmpty() {
        return this.coordinates.size === 0;
    }
    // Iterator support for easy iteration
    [Symbol.iterator]() {
        return this.getAllCoordinates()[Symbol.iterator]();
    }
}
exports.CoordinateSet = CoordinateSet;
