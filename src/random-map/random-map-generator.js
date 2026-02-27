"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomMapGenerator = void 0;
const map_size_1 = require("./map-size");
const types_1 = require("@lob-sdk/types");
const terrain_noise_1 = require("./executors/terrain-noise");
const height_noise_1 = require("./executors/height-noise");
const terrain_circle_1 = require("./executors/terrain-circle");
const terrain_rectangle_1 = require("./executors/terrain-rectangle");
const natural_path_1 = require("./executors/natural-path");
const connect_clusters_1 = require("./executors/connect-clusters");
const objective_1 = require("./executors/objective");
const objective_layer_1 = require("./executors/objective-layer");
const lake_1 = require("./executors/lake");
const seed_1 = require("@lob-sdk/seed");
const game_data_manager_1 = require("@lob-sdk/game-data-manager");
class RandomMapGenerator {
    generate({ scenario, dynamicBattleType, maxPlayers, seed, tileSize, era, tilesX, tilesY, }) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(era);
        const battleType = gameDataManager.getBattleType(dynamicBattleType);
        const mapSizeIndex = (0, map_size_1.getMapSizeIndex)(maxPlayers, battleType.mapSize.length);
        const battleSize = battleType.mapSize[mapSizeIndex];
        const mapSizes = gameDataManager.getMapSizes();
        const { map } = mapSizes[battleSize];
        if (!tilesX) {
            tilesX = map.tilesX;
        }
        if (!tilesY) {
            tilesY = map.tilesY;
        }
        const widthPx = tilesX * tileSize;
        const heightPx = tilesY * tileSize;
        const deploymentZones = [
            (0, map_size_1.getDeploymentZoneBySize)(battleSize, widthPx, heightPx, 1, era, tileSize),
            (0, map_size_1.getDeploymentZoneBySize)(battleSize, widthPx, heightPx, 2, era, tileSize),
        ];
        const objectives = [];
        const mapSeed = seed ?? (0, seed_1.generateRandomSeed)();
        const terrains = [];
        const heightMap = [];
        // Initialize arrays
        for (let x = 0; x < tilesX; x++) {
            terrains[x] = [];
            heightMap[x] = [];
            for (let y = 0; y < tilesY; y++) {
                terrains[x][y] = types_1.TerrainType.Grass;
                heightMap[x][y] = 0;
            }
        }
        // Use baseTerrain from scenario if present, otherwise default to Grass
        const baseTerrain = scenario.baseTerrain ?? types_1.TerrainType.Grass;
        // Generate terrain and height
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                // Start with base terrain
                terrains[x][y] = baseTerrain;
            }
        }
        this.executeInstructions(scenario, mapSeed, terrains, heightMap, objectives, widthPx, heightPx, tilesX, tilesY, tileSize);
        return {
            map: {
                width: tilesX * tileSize,
                height: tilesY * tileSize,
                terrains,
                heightMap,
                deploymentZones,
                seed: mapSeed,
            },
            objectives,
        };
    }
    executeInstructions(scenario, seed, terrains, heightMap, objectives, widthPx, heightPx, tilesX, tilesY, tileSize) {
        scenario.instructions.forEach((instruction, index) => {
            switch (instruction.type) {
                case types_1.InstructionType.HeightNoise: {
                    new height_noise_1.HeightNoiseExecutor(instruction, scenario, seed, index, terrains, heightMap).execute();
                    break;
                }
                case types_1.InstructionType.TerrainNoise: {
                    new terrain_noise_1.TerrainNoiseExecutor(instruction, scenario, seed, index, terrains, heightMap).execute();
                    break;
                }
                case types_1.InstructionType.TerrainCircle: {
                    new terrain_circle_1.TerrainCircleExecutor(instruction, scenario, seed, index, terrains, heightMap).execute();
                    break;
                }
                case types_1.InstructionType.TerrainRectangle: {
                    new terrain_rectangle_1.TerrainRectangleExecutor(instruction, scenario, seed, index, terrains, heightMap).execute();
                    break;
                }
                case types_1.InstructionType.NaturalPath: {
                    new natural_path_1.NaturalPathExecutor(instruction, scenario, seed, index, terrains, heightMap).execute();
                    break;
                }
                case types_1.InstructionType.ConnectClusters: {
                    new connect_clusters_1.ConnectClustersExecutor(instruction, scenario, seed, index, terrains, heightMap).execute();
                    break;
                }
                case types_1.InstructionType.Objective: {
                    new objective_1.ObjectiveExecutor(instruction, scenario, seed, index, widthPx, heightPx, objectives).execute();
                    break;
                }
                case types_1.InstructionType.Lake: {
                    new lake_1.LakeExecutor(instruction, scenario, seed, index, terrains, heightMap).execute();
                    break;
                }
                case types_1.InstructionType.ObjectiveLayer: {
                    new objective_layer_1.ObjectiveLayerExecutor(instruction, tileSize, scenario, seed, index, terrains, heightMap, objectives, tilesX, tilesY).execute();
                    break;
                }
                default: {
                    throw new Error(`Unknown instruction type: ${instruction?.type}`);
                }
            }
        });
    }
}
exports.RandomMapGenerator = RandomMapGenerator;
