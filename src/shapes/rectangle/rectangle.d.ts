import { Vector2 } from "@lob-sdk/vector";
import { ShapeType } from "../types";
export declare class Rectangle {
    center: Vector2;
    width: number;
    height: number;
    rotation: number;
    readonly shapeType = ShapeType.Rectangle;
    vertices: Vector2[];
    constructor(center: Vector2, width: number, height: number, rotation: number);
    updateVertices(): void;
    getEdges(): Vector2[];
    pointTouches(point: Vector2): boolean;
}
