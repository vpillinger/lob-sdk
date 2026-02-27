import { InstructionTerrainNoise, ProceduralScenario, TerrainType } from "@lob-sdk/types";
export declare class TerrainNoiseExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private noise;
    constructor(instruction: InstructionTerrainNoise, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][]);
    execute(): void;
    private applySmoothing;
}
