"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerrainNoiseExecutor = void 0;
const seed_1 = require("@lob-sdk/seed");
const simplex_noise_1 = require("@lob-sdk/simplex-noise");
const utils_1 = require("../utils");
class TerrainNoiseExecutor {
    instruction;
    scenario;
    seed;
    index;
    terrains;
    heightMap;
    noise;
    constructor(instruction, scenario, seed, index, terrains, heightMap) {
        this.instruction = instruction;
        this.scenario = scenario;
        this.seed = seed;
        this.index = index;
        this.terrains = terrains;
        this.heightMap = heightMap;
        this.noise = (0, simplex_noise_1.createNoise2D)((0, seed_1.randomSeeded)((0, seed_1.deriveSeed)(seed, index + 1)));
    }
    execute() {
        const { instruction, terrains, heightMap } = this;
        const { scale, multiplier, offset, ranges, height, terrain, smoothing } = instruction;
        const tilesX = this.terrains.length;
        const tilesY = this.terrains[0].length;
        let scaleX;
        let scaleY;
        if (typeof scale === "number") {
            scaleX = scale;
            scaleY = scale;
        }
        else {
            scaleX = scale.x;
            scaleY = scale.y;
        }
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                let value = this.noise(x / scaleX, y / scaleY);
                // Apply darkness adjustment
                value *= multiplier ?? 1;
                // Apply offset adjustment
                value += offset ?? 0;
                value = (0, utils_1.convertTo01Range)(value);
                // Check if value falls within any of the threshold ranges
                const shouldApplyTerrain = ranges.some((range) => value >= range.min && value <= range.max);
                if (shouldApplyTerrain) {
                    // Check height constraints if specified
                    const currentHeight = heightMap[x][y];
                    const heightConstraint = height;
                    if (!heightConstraint ||
                        (currentHeight >= heightConstraint.min &&
                            currentHeight <= heightConstraint.max)) {
                        terrains[x][y] = terrain;
                    }
                }
            }
        }
        // Apply smoothing if specified
        if (smoothing?.minSurrounding) {
            this.applySmoothing(smoothing.minSurrounding);
        }
    }
    applySmoothing(minSurrounding) {
        const { terrain } = this.instruction;
        const tilesX = this.terrains.length;
        const tilesY = this.terrains[0].length;
        // Create a copy of the terrain map for the smoothing pass
        const terrainCopy = this.terrains.map((row) => [...row]);
        // Side-only neighbor offsets: up, down, left, right
        const sideNeighbors = [
            [-1, 0], // left
            [1, 0], // right
            [0, -1], // up
            [0, 1], // down
        ];
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                if (terrainCopy[x][y] === terrain) {
                    let surroundingCount = 0;
                    for (const [dx, dy] of sideNeighbors) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < tilesX && ny >= 0 && ny < tilesY) {
                            if (terrainCopy[nx]?.[ny] === terrain) {
                                surroundingCount++;
                            }
                        }
                    }
                    if (surroundingCount < minSurrounding) {
                        this.terrains[x][y] = 0; // 0 = empty/default terrain
                    }
                }
            }
        }
    }
}
exports.TerrainNoiseExecutor = TerrainNoiseExecutor;
