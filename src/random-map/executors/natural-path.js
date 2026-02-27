"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturalPathExecutor = void 0;
const seed_1 = require("@lob-sdk/seed");
const utils_1 = require("../utils");
const natural_path_generator_1 = require("../natural-path-generator");
const utils_2 = require("@lob-sdk/utils");
class NaturalPathExecutor {
    instruction;
    scenario;
    seed;
    index;
    terrains;
    heightMap;
    random;
    constructor(instruction, scenario, seed, index, terrains, heightMap) {
        this.instruction = instruction;
        this.scenario = scenario;
        this.seed = seed;
        this.index = index;
        this.terrains = terrains;
        this.heightMap = heightMap;
        this.random = (0, seed_1.randomSeeded)((0, seed_1.deriveSeed)(seed, index + 1));
    }
    execute() {
        const { random, terrains, heightMap } = this;
        const { width, heightDiffCost, terrainReplacements, terrainCosts, amount, between, range = { min: 40, max: 60 }, terrain, startHeightRanges, endHeightRanges, height, } = this.instruction;
        const tilesX = this.terrains.length;
        const tilesY = this.terrains[0].length;
        const naturalPathGenerator = new natural_path_generator_1.NaturalPathGenerator(random, terrains, heightMap, width, 0.5, heightDiffCost, terrainReplacements, terrainCosts);
        const amountNumber = (0, utils_2.getRandomInt)(amount.min, amount.max, random);
        for (let i = 0; i < amountNumber; i++) {
            let start, end;
            if (between === "edges") {
                const edgePoints = (0, utils_1.getRandomEdgePoints)(tilesX, tilesY, random);
                start = edgePoints.start;
                end = edgePoints.end;
            }
            else if (between === "top-bottom") {
                // Vertical road: from top to bottom, with optional range
                const minX = Math.floor((range.min / 100) * tilesX);
                const maxX = Math.floor((range.max / 100) * tilesX);
                const startX = minX + Math.floor(random() * (maxX - minX + 1));
                const endX = minX + Math.floor(random() * (maxX - minX + 1));
                start = { x: startX, y: 0 };
                end = { x: endX, y: tilesY - 1 };
            }
            else if (between === "left-right") {
                // Horizontal road: from left to right, with optional range
                const minY = Math.floor((range.min / 100) * tilesY);
                const maxY = Math.floor((range.max / 100) * tilesY);
                const startY = minY + Math.floor(random() * (maxY - minY + 1));
                const endY = minY + Math.floor(random() * (maxY - minY + 1));
                start = { x: 0, y: startY };
                end = { x: tilesX - 1, y: endY };
            }
            if (start && end) {
                // Apply height filters if specified
                const validStart = this.findValidPointWithHeightFilter(start, startHeightRanges, between, tilesX, tilesY);
                const validEnd = this.findValidPointWithHeightFilter(end, endHeightRanges, between, tilesX, tilesY);
                if (validStart && validEnd) {
                    const pathResult = naturalPathGenerator.generatePath(validStart, validEnd);
                    const pathTiles = naturalPathGenerator.getPathTiles(pathResult);
                    pathTiles.forEach(({ x, y }) => {
                        if (x >= 0 && x < tilesX && y >= 0 && y < tilesY) {
                            const terrainType = naturalPathGenerator.getTerrainForTile(x, y, terrain, terrains);
                            terrains[x][y] = terrainType;
                            if (height !== undefined) {
                                (0, utils_2.setHeightRecursively)(x, y, height, heightMap);
                            }
                        }
                    });
                }
            }
        }
    }
    /**
     * Find a valid point that satisfies height ranges by searching along map edges
     * @param originalPoint The original point to search around
     * @param heightRanges Array of height ranges to check against
     * @param between The path direction type
     * @param tilesX Map width in tiles
     * @param tilesY Map height in tiles
     * @returns A valid point or null if none found
     */
    findValidPointWithHeightFilter(originalPoint, heightRanges, between, tilesX, tilesY) {
        // If no height ranges specified, return original point
        if (!heightRanges || heightRanges.length === 0) {
            return originalPoint;
        }
        // Check if original point satisfies height ranges
        if (this.satisfiesHeightRanges(originalPoint, heightRanges)) {
            return originalPoint;
        }
        // If no between type specified, return null
        if (!between || !tilesX || !tilesY) {
            return null;
        }
        // Search along the appropriate edges based on the path type
        return this.findValidPointAlongEdges(heightRanges, between, tilesX, tilesY);
    }
    /**
     * Find a valid point by searching along map edges based on path direction
     * @param heightRanges Array of height ranges to check against
     * @param between The path direction type
     * @param tilesX Map width in tiles
     * @param tilesY Map height in tiles
     * @returns A valid point or null if none found
     */
    findValidPointAlongEdges(heightRanges, between, tilesX, tilesY) {
        let edgePoints;
        if (between === "edges") {
            // Search all edges: top, bottom, left, right
            edgePoints = this.getEdgePoints(tilesX, tilesY);
        }
        else if (between === "top-bottom") {
            // Search only top and bottom edges
            edgePoints = this.getTopBottomEdgePoints(tilesX, tilesY);
        }
        else if (between === "left-right") {
            // Search only left and right edges
            edgePoints = this.getLeftRightEdgePoints(tilesX, tilesY);
        }
        else {
            edgePoints = [];
        }
        // Shuffle the edge points for random selection
        this.shuffleArray(edgePoints);
        // Check each edge point until we find a valid one
        for (const point of edgePoints) {
            if (this.satisfiesHeightRanges(point, heightRanges)) {
                return point;
            }
        }
        return null; // No valid point found
    }
    /**
     * Get all edge points of the map
     */
    getEdgePoints(tilesX, tilesY) {
        const points = [];
        // Top edge
        for (let x = 0; x < tilesX; x++) {
            points.push({ x, y: 0 });
        }
        // Bottom edge
        for (let x = 0; x < tilesX; x++) {
            points.push({ x, y: tilesY - 1 });
        }
        // Left edge (excluding corners already covered)
        for (let y = 1; y < tilesY - 1; y++) {
            points.push({ x: 0, y });
        }
        // Right edge (excluding corners already covered)
        for (let y = 1; y < tilesY - 1; y++) {
            points.push({ x: tilesX - 1, y });
        }
        return points;
    }
    /**
     * Get top and bottom edge points
     */
    getTopBottomEdgePoints(tilesX, tilesY) {
        const points = [];
        // Top edge
        for (let x = 0; x < tilesX; x++) {
            points.push({ x, y: 0 });
        }
        // Bottom edge
        for (let x = 0; x < tilesX; x++) {
            points.push({ x, y: tilesY - 1 });
        }
        return points;
    }
    /**
     * Get left and right edge points
     */
    getLeftRightEdgePoints(tilesX, tilesY) {
        const points = [];
        // Left edge
        for (let y = 0; y < tilesY; y++) {
            points.push({ x: 0, y });
        }
        // Right edge
        for (let y = 0; y < tilesY; y++) {
            points.push({ x: tilesX - 1, y });
        }
        return points;
    }
    /**
     * Shuffle array in place using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    /**
     * Check if a point satisfies the given height ranges
     * @param point The point to check
     * @param ranges Array of height ranges to check against
     * @returns True if the point satisfies at least one range, false otherwise
     */
    satisfiesHeightRanges(point, ranges) {
        const height = this.heightMap[point.x][point.y];
        return ranges.some((range) => {
            return height >= range.min && height <= range.max;
        });
    }
}
exports.NaturalPathExecutor = NaturalPathExecutor;
