import { InstructionObjectiveLayer, ObjectiveDto, ProceduralScenario, TerrainType } from "@lob-sdk/types";
export declare class ObjectiveLayerExecutor {
    private instruction;
    private tileSize;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private objectives;
    private tilesX;
    private tilesY;
    private random;
    private neighbors;
    constructor(instruction: InstructionObjectiveLayer, tileSize: number, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][], objectives: ObjectiveDto<false>[], tilesX: number, tilesY: number);
    execute(): void;
}
