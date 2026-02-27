import { PositionData } from "@lob-sdk/types";
import { Point2 } from "@lob-sdk/vector";
export declare const getPosition: (position: PositionData, width: number, height: number, randomFn?: () => number) => [number, number];
export declare function convertTo01Range(value: number): number;
export declare function getRandomEdgePoints(tilesX: number, tilesY: number, randomFn: () => number): {
    start: Point2;
    end: Point2;
};
