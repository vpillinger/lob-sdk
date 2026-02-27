import { InstructionObjective, ObjectiveDto, ProceduralScenario } from "@lob-sdk/types";
export declare class ObjectiveExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private widthPx;
    private heightPx;
    private objectives;
    private random;
    constructor(instruction: InstructionObjective, scenario: ProceduralScenario, seed: number, index: number, widthPx: number, heightPx: number, objectives: ObjectiveDto<false>[]);
    execute(): void;
}
