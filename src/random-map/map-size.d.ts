import { TeamDeploymentZone, Size } from "@lob-sdk/types";
import { GameEra } from "@lob-sdk/game-data-manager";
/**
 * Calculates the map size index based on the number of players.
 * Every 2 players the array index increases by one, unless
 * the last index is reached, in that case, the last index is used.
 *
 * @param maxPlayers - Maximum number of players
 * @param mapSizeArrayLength - Length of the mapSize array
 * @returns The index to use in the mapSize array
 */
export declare const getMapSizeIndex: (maxPlayers: number, mapSizeArrayLength: number) => number;
export declare const getDeploymentZoneBySize: (size: Size, mapWidth: number, mapHeight: number, team: number, era: GameEra, tileSize: number) => TeamDeploymentZone;
