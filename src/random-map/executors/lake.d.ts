import { InstructionLake, ProceduralScenario, TerrainType } from "@lob-sdk/types";
export declare class LakeExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private tilesX;
    private tilesY;
    private random;
    private noise;
    constructor(instruction: InstructionLake, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][]);
    execute(): void;
    private getRandomRadius;
    private generateLakeTerrain;
    private generateSingleLake;
}
