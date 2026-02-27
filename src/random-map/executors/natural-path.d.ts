import { ProceduralScenario, InstructionNaturalPath, TerrainType } from "@lob-sdk/types";
export declare class NaturalPathExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private random;
    constructor(instruction: InstructionNaturalPath, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][]);
    execute(): void;
    /**
     * Find a valid point that satisfies height ranges by searching along map edges
     * @param originalPoint The original point to search around
     * @param heightRanges Array of height ranges to check against
     * @param between The path direction type
     * @param tilesX Map width in tiles
     * @param tilesY Map height in tiles
     * @returns A valid point or null if none found
     */
    private findValidPointWithHeightFilter;
    /**
     * Find a valid point by searching along map edges based on path direction
     * @param heightRanges Array of height ranges to check against
     * @param between The path direction type
     * @param tilesX Map width in tiles
     * @param tilesY Map height in tiles
     * @returns A valid point or null if none found
     */
    private findValidPointAlongEdges;
    /**
     * Get all edge points of the map
     */
    private getEdgePoints;
    /**
     * Get top and bottom edge points
     */
    private getTopBottomEdgePoints;
    /**
     * Get left and right edge points
     */
    private getLeftRightEdgePoints;
    /**
     * Shuffle array in place using Fisher-Yates algorithm
     */
    private shuffleArray;
    /**
     * Check if a point satisfies the given height ranges
     * @param point The point to check
     * @param ranges Array of height ranges to check against
     * @returns True if the point satisfies at least one range, false otherwise
     */
    private satisfiesHeightRanges;
}
