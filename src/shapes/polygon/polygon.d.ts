import { Circle } from "../circle";
import { BoundingBox, ShapeType } from "../types";
import { Point2 } from "@lob-sdk/vector";
export declare class Polygon {
    readonly shapeType = ShapeType.Polygon;
    private vertices;
    private boundingBox;
    constructor(points: Point2[]);
    getBoundingBox(): BoundingBox;
    private calculateBoundingBox;
    isPointInside(point: Point2): boolean;
    intersectsWith(other: Polygon): boolean;
    private projectOntoAxis;
    static fromRotatedRectangle(centerX: number, centerY: number, width: number, height: number, angleInRadians: number): Polygon;
    static fromRotatedTrapezoid(centerX: number, centerY: number, topWidth: number, bottomWidth: number, height: number, angleInRadians: number): Polygon;
    getVertices(): Point2[];
    getVerticesArr(): number[];
    intersectsWithLine(lineStart: Point2, lineEnd: Point2): boolean;
    private lineSegmentsIntersect;
    private getOrientation;
    private isPointOnSegment;
    intersectsWithCircle(circle: Circle): boolean;
    intersectsWithCircles(circles: Circle[]): boolean;
}
