import { IServerGame } from "@lob-sdk/types";
import { BaseUnit } from "@lob-sdk/unit";
import { Vector2 } from "@lob-sdk/vector";
import { GameDataManager } from "@lob-sdk/game-data-manager";
import { TerrainPreference } from "./types";
/**
 * Clamps a position to the map boundaries with a margin.
 */
export declare function clampToMap(pos: Vector2, game: IServerGame): Vector2;
/**
 * Splits an array of units into lines of a maximum size.
 */
export declare function splitIntoLines(units: BaseUnit[], maxPerLine: number): BaseUnit[][];
/**
 * Splits cavalry units into left and right flanks.
 * Uses slice to maintain distance optimization if units are pre-sorted.
 */
export declare function splitCavalry(units: BaseUnit[]): {
    left: BaseUnit[];
    right: BaseUnit[];
};
/**
 * Calculates positions for units in a line and returns them.
 */
export declare function calculateLinePositions(units: BaseUnit[], center: Vector2, direction: Vector2, perpendicular: Vector2, forwardOffset: number, spacing: number, game: IServerGame): Vector2[];
/**
 * Calculates positions for units on a flank and returns them.
 */
export declare function calculateFlankPositions(units: BaseUnit[], center: Vector2, direction: Vector2, perpendicular: Vector2, sideOffset: number, spacing: number, game: IServerGame, maxRows?: number, forwardOffset?: number): Vector2[];
/**
 * Sorts units along a given vector (e.g. the perpendicular of a line).
 * Uses position projection and unit ID tie-breaking for perfect determinism.
 */
export declare function sortUnitsAlongVector(units: BaseUnit[], vector: Vector2): BaseUnit[];
/**
 * Finds the most preferred position nearby based on categories and elevation.
 * Unified API for artillery high ground and skirmisher cover.
 */
export declare function findPreferredTerrain(pos: Vector2, game: IServerGame, gameDataManager: GameDataManager, preference: TerrainPreference, searchRadiusTiles?: number): Vector2;
/**
 * @deprecated Use findPreferredTerrain instead
 */
export declare function findHighGroundNearby(pos: Vector2, game: IServerGame, searchRadiusTiles?: number): Vector2;
/**
 * @deprecated Use findPreferredTerrain instead
 */
export declare function findCoverNearby(pos: Vector2, game: IServerGame, searchRadiusTiles?: number): Vector2;
/**
 * Checks if a position is passable for a unit, with an optional safety radius.
 */
export declare function isPassable(pos: Vector2, game: IServerGame, gameDataManager: GameDataManager, safetyRadiusTiles?: number): boolean;
/**
 * Checks if there is a clear straight path between two positions.
 */
export declare function isPathClear(start: Vector2, end: Vector2, game: IServerGame, gameDataManager: GameDataManager): boolean;
/**
 * Finds the nearest passable position to a target using BFS.
 */
export declare function findReachablePosition(target: Vector2, game: IServerGame, gameDataManager: GameDataManager): Vector2;
/**
 * Calculates a path from start to end, avoiding obstacles.
 */
export declare function calculatePath(start: Vector2, end: Vector2, unit: BaseUnit, game: IServerGame, gameDataManager: GameDataManager): Vector2[];
