import { Point2 } from "@lob-sdk/vector";
/**
 * Simplifies a path using the Douglas-Peucker algorithm.
 * Removes points that are within epsilon distance of the line segment between their neighbors.
 * @param path - The path to simplify.
 * @param epsilon - The maximum distance a point can be from the line segment before it's kept (default: 0.5).
 * @returns A simplified path with fewer points.
 * @template T - The type of point, must extend Point2.
 */
export declare function douglasPeucker<T extends Point2>(path: T[], epsilon?: number): T[];
