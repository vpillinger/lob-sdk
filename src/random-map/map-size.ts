import { TeamDeploymentZone, Size } from "@lob-sdk/types";
import { GameEra, GameDataManager } from "@lob-sdk/game-data-manager";
import { calculateCircularDeploymentZone } from "@common/army";

/**
 * Calculates the map size index based on the number of players.
 * Every 2 players the array index increases by one, unless
 * the last index is reached, in that case, the last index is used.
 *
 * @param maxPlayers - Maximum number of players
 * @param mapSizeArrayLength - Length of the mapSize array
 * @returns The index to use in the mapSize array
 */
export const getMapSizeIndex = (
  maxPlayers: number,
  mapSizeArrayLength: number
): number => {
  // Calculate index: every 2 players increases index by 1
  // For 2 players: index 0, for 4 players: index 1, etc.
  const calculatedIndex = Math.floor(maxPlayers / 2) - 1;

  // Clamp to valid array bounds: [0, mapSizeArrayLength - 1]
  return Math.max(0, Math.min(calculatedIndex, mapSizeArrayLength - 1));
};

export const getDeploymentZoneBySize = (
  size: Size,
  mapWidth: number,
  mapHeight: number,
  team: number,
  era: GameEra,
  tileSize: number,
  numTeams?: number // Optional: number of teams for circular distribution
): TeamDeploymentZone => {
  const mapSizes = GameDataManager.get(era).getMapSizes();
  let zoneSettings = mapSizes[size].deployment;

  // Convert radius from tiles to pixels
  // For circular zones, we use the radius directly
  const zoneRadius = zoneSettings.radius * tileSize;

  // Use circular distribution if numTeams is provided (and > 1)
  if (numTeams !== undefined && numTeams > 1) {
    return calculateCircularDeploymentZone(
      team,
      numTeams,
      mapWidth,
      mapHeight,
      zoneRadius
    );
  }

  // Fallback to old linear distribution for backward compatibility
  // This is deprecated but kept for compatibility
  const zoneSeparation = zoneSettings.zoneSeparation * tileSize;
  const zoneDiameter = zoneRadius * 2;

  // Calculate centered X coordinate
  const x = (mapWidth - zoneDiameter) / 2;

  // Calculate Y coordinate, centering zones vertically with zoneSeparation
  const totalHeight = 2 * zoneDiameter + zoneSeparation;
  const y =
    team === 1
      ? (mapHeight + totalHeight) / 2 - zoneDiameter
      : (mapHeight - totalHeight) / 2;

  return { team, x, y, radius: zoneRadius };
};
