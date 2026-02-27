"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector3 = void 0;
const vector2_1 = require("./vector2");
/**
 * A 3D vector class providing mathematical operations for 3D vectors.
 */
class Vector3 {
    x;
    y;
    z;
    /**
     * Creates a new Vector3 instance.
     * @param x - The x component of the vector.
     * @param y - The y component of the vector.
     * @param z - The z component of the vector.
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * Creates a Vector3 from a Vector2 and a z value.
     * @param v - The 2D vector.
     * @param z - The z component.
     * @returns A new Vector3 instance.
     */
    static fromVector2(v, z) {
        return new Vector3(v.x, v.y, z);
    }
    /**
     * Adds another vector to this vector and returns a new vector.
     * @param v - The vector to add.
     * @returns A new vector representing the sum.
     */
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    /**
     * Subtracts another vector from this vector and returns a new vector.
     * @param v - The vector to subtract.
     * @returns A new vector representing the difference.
     */
    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    /**
     * Multiplies this vector by a scalar and returns a new vector.
     * @param scalar - The scalar value to multiply by.
     * @returns A new scaled vector.
     */
    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    /**
     * Calculates the distance from this vector to another vector.
     * @param v - The vector to calculate the distance to.
     * @returns The distance.
     */
    distanceTo(v) {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2);
    }
    /**
     * Converts this vector to a Vector2 by dropping the z component.
     * @returns A new Vector2 with the x and y components.
     */
    toVector2() {
        return new vector2_1.Vector2(this.x, this.y);
    }
    /**
     * Multiplies this vector by a scalar and returns a new vector.
     * @param scalar - The scalar value to multiply by.
     * @returns A new scaled vector.
     */
    scale(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    /**
     * Calculates the dot product of this vector with another vector.
     * @param v - The vector to calculate the dot product with.
     * @returns The dot product value.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    /**
     * Calculates the cross product of this vector with another vector.
     * @param v - The vector to calculate the cross product with.
     * @returns A new vector representing the cross product.
     */
    cross(v) {
        return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    /**
     * Normalizes this vector to unit length and returns a new vector.
     * If the vector is zero, returns the zero vector.
     * @returns A new normalized vector.
     */
    normalize() {
        const length = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
        return length > 0 ? this.scale(1 / length) : this;
    }
    /**
     * Rounds the components of this vector to a specified number of decimal places.
     * @param decimals - The number of decimal places to round to (default: 0).
     * @returns A new vector with rounded components.
     */
    round(decimals = 0) {
        const factor = Math.pow(10, decimals);
        return new Vector3(Math.round(this.x * factor) / factor, Math.round(this.y * factor) / factor, Math.round(this.z * factor) / factor);
    }
    /**
     * Calculates the length (magnitude) of this vector.
     * @returns The length of the vector.
     */
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
    /**
     * Scales only the x and y components of this vector, leaving z unchanged.
     * @param scalar - The scalar value to multiply x and y by.
     * @returns A new vector with scaled x and y components.
     */
    scaleXY(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z);
    }
    /**
     * Floors the x and y components of this vector, leaving z unchanged.
     * @returns A new vector with floored x and y components.
     */
    floorXY() {
        return new Vector3(Math.floor(this.x), Math.floor(this.y), this.z);
    }
    /**
     * Checks if this vector is equal to another vector.
     * @param vector - The vector to compare with.
     * @returns True if all components are equal, false otherwise.
     */
    equals(vector) {
        return this.x === vector.x && this.y === vector.y && this.z === vector.z;
    }
}
exports.Vector3 = Vector3;
