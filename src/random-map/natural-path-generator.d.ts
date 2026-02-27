import { TerrainType } from "@lob-sdk/types";
import { Point2 } from "@lob-sdk/vector";
interface TerrainReplacement {
    fromTerrain: TerrainType;
    toTerrain: TerrainType;
}
interface TerrainCost {
    terrain: TerrainType;
    cost: number;
}
export declare class NaturalPathGenerator {
    private randomFn;
    private terrains;
    private heightMap;
    private width;
    private noiseScale;
    private heightDiffCost;
    private terrainReplacements;
    private terrainCosts;
    constructor(randomFn: () => number, terrains: TerrainType[][], heightMap: number[][], width?: number, noiseScale?: number, heightDiffCost?: number, terrainReplacements?: TerrainReplacement[], terrainCosts?: TerrainCost[]);
    generatePath(start: Point2, goal: Point2): Point2[];
    private generateNoise;
    private heuristic;
    private isValidTile;
    private isValidPathSegment;
    private calculateHeightDiffCost;
    private reconstructPath;
    getPathTiles(path: Point2[]): Point2[];
    private bresenhamLine;
    /**
     * Determines the appropriate terrain type for a path tile based on terrain replacement rules
     * @param x X coordinate of the tile
     * @param y Y coordinate of the tile
     * @param baseTerrain The base terrain type for the path
     * @param terrains The terrain map to check against
     * @returns The terrain type to use for this tile
     */
    getTerrainForTile(x: number, y: number, baseTerrain: TerrainType, terrains: TerrainType[][]): TerrainType;
    /**
     * Calculates the terrain cost for a given position
     * @param position The position to check
     * @returns The terrain cost (defaults to 1 if no cost is specified)
     */
    private calculateTerrainCost;
}
export {};
