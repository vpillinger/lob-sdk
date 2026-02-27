import { ProceduralScenario, InstructionHeightNoise, TerrainType } from "@lob-sdk/types";
export declare class HeightNoiseExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private noiseFns;
    private randomFns;
    private scalesX;
    private scalesY;
    constructor(instruction: InstructionHeightNoise, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][]);
    execute(): void;
    private setTileBaseHeight;
}
