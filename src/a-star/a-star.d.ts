import { Point2 } from "@lob-sdk/vector";
/**
 * An optimized A* pathfinding algorithm implementation with caching and subpath reuse.
 * Supports both 4-directional and 8-directional movement.
 */
export declare class AStar {
    private static readonly CARDINAL_DIRECTIONS;
    private static readonly DIAGONAL_DIRECTIONS;
    private width;
    private height;
    private getStepCost;
    private readonly DIAGONAL_COST;
    private neighborDirections;
    private pathCache;
    private subpathCache;
    private maxKey;
    private neighborsArray;
    private pathArray;
    private openList;
    private openSet;
    private closedSet;
    private nodeMap;
    private nodePool;
    private nodePoolIndex;
    /**
     * Creates a new AStar pathfinding instance.
     * @param width - The width of the grid in tiles.
     * @param height - The height of the grid in tiles.
     * @param getStepCost - A function that returns the cost to move from one point to another. Returns Infinity for impassable terrain.
     * @param useDiagonals - Whether to allow diagonal movement (8-directional) or only cardinal directions (4-directional). Defaults to true.
     */
    constructor(width: number, height: number, getStepCost: (from: Point2, to: Point2) => number, useDiagonals?: boolean);
    /**
     * Clears the path cache, freeing memory used by cached paths.
     */
    clearCache(): void;
    /**
     * Calculates the heuristic distance between two points using Chebyshev distance for 8-directional movement.
     * This is faster than Euclidean distance and still admissible.
     * @param x1 - The x coordinate of the first point.
     * @param y1 - The y coordinate of the first point.
     * @param x2 - The x coordinate of the second point.
     * @param y2 - The y coordinate of the second point.
     * @returns The heuristic distance estimate.
     */
    private heuristic;
    /**
     * Encodes coordinates as a single number for efficient hashing.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns A unique numeric key for the position.
     */
    private encodeKey;
    /**
     * Gets a Node from the pool or creates a new one for memory efficiency.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @returns A Node instance for the given coordinates.
     */
    private getNode;
    /**
     * Finds the optimal path from start to end using the A* algorithm.
     * Uses caching and subpath reuse for improved performance.
     * @param start - The starting point.
     * @param end - The destination point.
     * @returns An array of points representing the path, or null if no path exists.
     */
    findPath(start: Point2, end: Point2): Point2[] | null;
    /**
     * Gets all valid neighboring points for a given node.
     * @param node - The node to get neighbors for.
     * @returns An array of valid neighboring points.
     */
    private getNeighbors;
    /**
     * Checks if a point is within the valid bounds of the grid.
     * @param point - The point to validate.
     * @returns True if the point is valid, false otherwise.
     */
    private isValidPoint;
    /**
     * Reconstructs the path from the goal node back to the start by following parent pointers.
     * @param node - The goal node.
     * @returns An array of points representing the path from start to goal.
     */
    private reconstructPath;
}
