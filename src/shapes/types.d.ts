import { Circle } from "./circle";
import { Polygon } from "./polygon";
import { Rectangle } from "./rectangle";
export interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
export declare enum ShapeType {
    Rectangle = 0,
    Circle = 1,
    Polygon = 2
}
export type Shape = Rectangle | Circle | Polygon;
