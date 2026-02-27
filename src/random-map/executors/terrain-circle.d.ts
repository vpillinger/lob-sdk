import { ProceduralScenario, InstructionTerrainCircle, TerrainType } from "@lob-sdk/types";
export declare class TerrainCircleExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private noise;
    private random;
    constructor(instruction: InstructionTerrainCircle, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][]);
    execute(): void;
}
