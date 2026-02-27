import { Polygon } from "../polygon";
import { BoundingBox, ShapeType } from "../types";
import { Point2, Vector2 } from "@lob-sdk/vector";
export declare class Circle {
    readonly shapeType = ShapeType.Circle;
    position: Vector2;
    radius: number;
    constructor(centerX: number, centerY: number, radius: number);
    private _boundingBox;
    get boundingBox(): BoundingBox;
    private calculateBoundingBox;
    /**
     * Checks if this circle collides with another and returns the squared distance between their centers if they collide
     * @param other The other circle to check collision with
     * @returns The squared distance between the centers if the circles collide, or null if they don't
     */
    getCollisionSquaredDistance(other: Circle): number | null;
    /**
     * Check if a point is inside the circle
     */
    isPointInside(point: Point2): boolean;
    /**
     * Check if this circle intersects with a polygon
     */
    intersectsWithPolygon(polygon: Polygon): boolean;
    /**
     * Check if circle intersects with a line segment, optionally considering line width
     * @param lineStart Starting point of the line segment
     * @param lineEnd Ending point of the line segment
     * @param lineWidth Optional width of the line (default: 0, infinitely thin)
     * @returns true if the circle intersects with the line segment, false otherwise
     */
    intersectsWithLine(lineStart: Point2, lineEnd: Point2, lineWidth?: number): boolean;
    getRadius(): number;
    getBoundingBox(): BoundingBox;
    /**
     * Check if this circle intersects with any circle in the provided array
     * @param circles Array of circles to check intersection with
     * @returns true if this circle intersects with any circle in the array, false otherwise
     */
    intersectsWithCircles(circles: Circle[]): boolean;
}
