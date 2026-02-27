import { Vector2 } from "./vector2";
/**
 * A 3D point with x, y, and z coordinates.
 */
export interface Point3 {
    /** The x coordinate. */
    x: number;
    /** The y coordinate. */
    y: number;
    /** The z coordinate. */
    z: number;
}
/**
 * A 3D vector class providing mathematical operations for 3D vectors.
 */
export declare class Vector3 {
    x: number;
    y: number;
    z: number;
    /**
     * Creates a new Vector3 instance.
     * @param x - The x component of the vector.
     * @param y - The y component of the vector.
     * @param z - The z component of the vector.
     */
    constructor(x: number, y: number, z: number);
    /**
     * Creates a Vector3 from a Vector2 and a z value.
     * @param v - The 2D vector.
     * @param z - The z component.
     * @returns A new Vector3 instance.
     */
    static fromVector2(v: Vector2, z: number): Vector3;
    /**
     * Adds another vector to this vector and returns a new vector.
     * @param v - The vector to add.
     * @returns A new vector representing the sum.
     */
    add(v: Vector3): Vector3;
    /**
     * Subtracts another vector from this vector and returns a new vector.
     * @param v - The vector to subtract.
     * @returns A new vector representing the difference.
     */
    subtract(v: Vector3): Vector3;
    /**
     * Multiplies this vector by a scalar and returns a new vector.
     * @param scalar - The scalar value to multiply by.
     * @returns A new scaled vector.
     */
    multiply(scalar: number): Vector3;
    /**
     * Calculates the distance from this vector to another vector.
     * @param v - The vector to calculate the distance to.
     * @returns The distance.
     */
    distanceTo(v: Vector3): number;
    /**
     * Converts this vector to a Vector2 by dropping the z component.
     * @returns A new Vector2 with the x and y components.
     */
    toVector2(): Vector2;
    /**
     * Multiplies this vector by a scalar and returns a new vector.
     * @param scalar - The scalar value to multiply by.
     * @returns A new scaled vector.
     */
    scale(scalar: number): Vector3;
    /**
     * Calculates the dot product of this vector with another vector.
     * @param v - The vector to calculate the dot product with.
     * @returns The dot product value.
     */
    dot(v: Vector3): number;
    /**
     * Calculates the cross product of this vector with another vector.
     * @param v - The vector to calculate the cross product with.
     * @returns A new vector representing the cross product.
     */
    cross(v: Vector3): Vector3;
    /**
     * Normalizes this vector to unit length and returns a new vector.
     * If the vector is zero, returns the zero vector.
     * @returns A new normalized vector.
     */
    normalize(): Vector3;
    /**
     * Rounds the components of this vector to a specified number of decimal places.
     * @param decimals - The number of decimal places to round to (default: 0).
     * @returns A new vector with rounded components.
     */
    round(decimals?: number): Vector3;
    /**
     * Calculates the length (magnitude) of this vector.
     * @returns The length of the vector.
     */
    length(): number;
    /**
     * Scales only the x and y components of this vector, leaving z unchanged.
     * @param scalar - The scalar value to multiply x and y by.
     * @returns A new vector with scaled x and y components.
     */
    scaleXY(scalar: number): Vector3;
    /**
     * Floors the x and y components of this vector, leaving z unchanged.
     * @returns A new vector with floored x and y components.
     */
    floorXY(): Vector3;
    /**
     * Checks if this vector is equal to another vector.
     * @param vector - The vector to compare with.
     * @returns True if all components are equal, false otherwise.
     */
    equals(vector: Vector3): boolean;
}
