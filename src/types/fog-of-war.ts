import { EntityId } from "@lob-sdk/types";

export enum VisionLevel {
  NotVisible = 0,
  VisibleFullyUnknown = 1,
  VisiblePartiallyUnknown = 2,
  FullyVisible = 3,
}

export interface FogOfWarResult {
  unitVisionLevels: Map<EntityId, VisionLevel>; // Map of unit IDs to their vision levels
}

export interface IServerFogOfWarService {}
