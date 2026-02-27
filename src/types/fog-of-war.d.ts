import { EntityId } from "@lob-sdk/types";
export declare enum VisionLevel {
    NotVisible = 0,
    VisibleFullyUnknown = 1,
    VisiblePartiallyUnknown = 2,
    VisibleWithoutBars = 3,
    FullyVisible = 4
}
export interface FogOfWarResult {
    unitVisionLevels: Map<EntityId, VisionLevel>;
}
export interface IServerFogOfWarService {
}
