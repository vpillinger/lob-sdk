"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LakeExecutor = void 0;
const utils_1 = require("../utils");
const seed_1 = require("@lob-sdk/seed");
const simplex_noise_1 = require("@lob-sdk/simplex-noise");
const utils_2 = require("@lob-sdk/utils");
const data_structures_1 = require("@lob-sdk/data-structures");
class LakeExecutor {
    instruction;
    scenario;
    seed;
    index;
    terrains;
    heightMap;
    tilesX;
    tilesY;
    random;
    noise;
    constructor(instruction, scenario, seed, index, terrains, heightMap) {
        this.instruction = instruction;
        this.scenario = scenario;
        this.seed = seed;
        this.index = index;
        this.terrains = terrains;
        this.heightMap = heightMap;
        this.tilesX = this.terrains.length;
        this.tilesY = this.terrains[0].length;
        this.random = (0, seed_1.randomSeeded)((0, seed_1.deriveSeed)(seed, index + 1));
        this.noise = (0, simplex_noise_1.createNoise2D)(this.random);
    }
    execute() {
        const { position, size, organicness } = this.instruction;
        const lakeBodies = [];
        const [positionX, positionY] = (0, utils_1.getPosition)(position, this.tilesX, this.tilesY, this.random);
        const center = { x: positionX, y: positionY };
        const radius = this.getRandomRadius(size);
        lakeBodies.push({ center, radius, organicness });
        // Generate the actual lake terrain
        this.generateLakeTerrain(lakeBodies);
    }
    getRandomRadius(sizeRange) {
        const minRadius = (sizeRange.min / 100) * Math.min(this.tilesX, this.tilesY);
        const maxRadius = (sizeRange.max / 100) * Math.min(this.tilesX, this.tilesY);
        return minRadius + this.random() * (maxRadius - minRadius);
    }
    generateLakeTerrain(lakeBodies) {
        for (const lake of lakeBodies) {
            this.generateSingleLake(lake);
        }
    }
    generateSingleLake(lake) {
        const { center, radius, organicness } = lake;
        const maxRadius = radius + radius * 0.3; // Allow some variation
        // Calculate bounds that account for maximum organic variation
        const maxOrganicVariation = organicness * radius * 0.4;
        const expandedMaxRadius = maxRadius + maxOrganicVariation;
        const minX = Math.max(0, Math.floor(center.x - expandedMaxRadius));
        const maxX = Math.min(this.tilesX - 1, Math.floor(center.x + expandedMaxRadius));
        const minY = Math.max(0, Math.floor(center.y - expandedMaxRadius));
        const maxY = Math.min(this.tilesY - 1, Math.floor(center.y + expandedMaxRadius));
        const iterateNeighbors = (x, y, radius, callback) => {
            for (let offsetX = -radius; offsetX <= radius; offsetX++) {
                for (let offsetY = -radius; offsetY <= radius; offsetY++) {
                    if (offsetX === 0 && offsetY === 0)
                        continue; // Skip the center
                    // Chebyshev distance (king moves) for step cost
                    const stepCost = Math.max(Math.abs(offsetX), Math.abs(offsetY));
                    if (stepCost <= radius) {
                        const nx = x + offsetX;
                        const ny = y + offsetY;
                        if (this.terrains[nx]?.[ny] !== undefined) {
                            callback(nx, ny);
                        }
                    }
                }
            }
        };
        const deepTiles = new data_structures_1.CoordinateSet();
        const shallowTiles = new data_structures_1.CoordinateSet();
        // Step 1: Generate deep water core
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const dx = x - center.x;
                const dy = y - center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // Apply organic variation to radius
                const angle = Math.atan2(dy, dx);
                const noiseValue = this.noise(Math.cos(angle) * 2, Math.sin(angle) * 2);
                const organicRadius = radius + noiseValue * organicness * radius * 0.4;
                if (distance <= organicRadius) {
                    this.terrains[x][y] = this.instruction.terrains.deep;
                    (0, utils_2.setHeightRecursively)(x, y, 0, this.heightMap);
                    deepTiles.add(x, y);
                }
            }
        }
        for (const [x, y] of deepTiles) {
            iterateNeighbors(x, y, 2, (dx, dy) => {
                if (deepTiles.has(dx, dy)) {
                    return;
                }
                this.terrains[dx][dy] = this.instruction.terrains.shallow;
                (0, utils_2.setHeightRecursively)(dx, dy, 0, this.heightMap);
                shallowTiles.add(dx, dy);
            });
        }
        for (const [x, y] of shallowTiles) {
            iterateNeighbors(x, y, 1, (dx, dy) => {
                if (deepTiles.has(dx, dy) || shallowTiles.has(dx, dy)) {
                    return;
                }
                this.terrains[dx][dy] = this.instruction.terrains.shore;
                (0, utils_2.setHeightRecursively)(dx, dy, 0, this.heightMap);
            });
        }
    }
}
exports.LakeExecutor = LakeExecutor;
