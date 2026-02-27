import { ProceduralScenario, InstructionTerrainRectangle, TerrainType } from "@lob-sdk/types";
export declare class TerrainRectangleExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private random;
    constructor(instruction: InstructionTerrainRectangle, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][]);
    execute(): void;
    private generateRectangleStructure;
}
