import { ProceduralScenario, InstructionConnectClusters, TerrainType } from "@lob-sdk/types";
export declare class ConnectClustersExecutor {
    private instruction;
    private scenario;
    private seed;
    private index;
    private terrains;
    private heightMap;
    private random;
    private visited;
    constructor(instruction: InstructionConnectClusters, scenario: ProceduralScenario, seed: number, index: number, terrains: TerrainType[][], heightMap: number[][]);
    /**
     * For each cluster, connects it to its single closest neighbor (or all equally-close neighbors in case of ties)
     * within maxClusterConnectDistance. Does not guarantee a fully connected graph.
     */
    execute(): void;
}
