import { UnitDtoPartialId, UnitCounts, DynamicBattleType, Zone } from "@lob-sdk/types";
import { GameDataManager } from "@lob-sdk/game-data-manager";
/**
 * Metrics for calculating unit deployment positions within the deployment zone.
 * The deployment zone is divided into three horizontal sections: left flank (25%),
 * center (50%), and right flank (25%).
 */
interface SectionMetrics {
    /** Horizontal width (in pixels/units) of the left flank section. Represents 25% of the deployment zone width. */
    leftFlankWidth: number;
    /** Horizontal width (in pixels/units) of the center section. Represents 50% of the deployment zone width. */
    centerWidth: number;
    /** Horizontal width (in pixels/units) of the right flank section. Represents 25% of the deployment zone width. */
    rightFlankWidth: number;
    /** Starting X coordinate of the left flank section. */
    leftFlankStartX: number;
    /** Starting X coordinate of the center section. */
    centerStartX: number;
    /** Starting X coordinate of the right flank section. */
    rightFlankStartX: number;
    /** Maximum number of units that can fit in a single row within the left flank section. */
    leftFlankMaxUnits: number;
    /** Maximum number of units that can fit in a single row within the center section. */
    centerMaxUnits: number;
    /** Maximum number of units that can fit in a single row within the right flank section. */
    rightFlankMaxUnits: number;
    /** Spacing (in pixels/units) between units in the left flank section. */
    leftFlankSpacing: number;
    /** Spacing (in pixels/units) between units in the center section. */
    centerSpacing: number;
    /** Spacing (in pixels/units) between units in the right flank section. */
    rightFlankSpacing: number;
    /** Y coordinate for deploying units in the center section. */
    centerY: number;
    /** Y coordinate for deploying forward units (e.g., skirmishers). */
    forwardY: number;
    /** Y coordinate for deploying front units. */
    frontY: number;
    /** Y coordinate for deploying flank units. */
    flankY: number;
}
/**
 * Handles the deployment of units within a deployment zone, organizing them into sections
 * (flank, center, forward, front) based on their unit categories.
 */
export declare class ArmyDeployer {
    private gameDataManager;
    private readonly DEFAULT_UNIT_HEIGHT;
    private readonly MIN_SPACING;
    private readonly MARGIN;
    private readonly units;
    private readonly deploymentZone;
    private readonly player;
    private readonly team;
    private readonly dynamicBattleType;
    private readonly unitDtos;
    private readonly metrics;
    private readonly rotation;
    private readonly forwardDeploymentZoneOffset;
    /**
     * Creates a new ArmyDeployer instance.
     * @param gameDataManager - The game data manager instance.
     * @param units - A record mapping unit types to their counts.
     * @param deploymentZone - The zone where units should be deployed.
     * @param player - The player number.
     * @param team - The team number (1 or 2).
     * @param dynamicBattleType - The battle type (defaults to Combat).
     */
    constructor(gameDataManager: GameDataManager, units: UnitCounts, deploymentZone: Zone, player: number, team: number, dynamicBattleType?: DynamicBattleType);
    /**
     * Deploys all units in the deployment zone according to their categories and deployment sections.
     * @returns An array of unit DTOs with their positions and rotations set.
     */
    deploy(): UnitDtoPartialId[];
    /**
     * Groups units by deployment section in a single pass for efficiency.
     * This avoids iterating through categories multiple times.
     */
    private groupUnitsByDeploymentSection;
    /**
     * Adds a unit to the deployment list at the specified position.
     * @param type - The unit type to deploy.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     */
    private addUnit;
    /**
     * Deploys units in multiple lines within a section.
     * @param units - The units to deploy.
     * @param baseY - The base Y coordinate for deployment.
     * @param startX - The starting X coordinate.
     * @param sectionWidth - The width of the section.
     * @param maxUnitsPerRow - The maximum number of units per row.
     * @param spacing - The spacing between units.
     * @param reverseY - Whether to reverse the Y direction for deployment.
     */
    private deployUnitsInLines;
    /**
     * Calculates metrics for each deployment section (left flank, center, right flank).
     * @returns A SectionMetrics object containing calculated dimensions and positions.
     */
    calculateSectionMetrics(): SectionMetrics;
    /**
     * Deploys units in the flank sections (left and right).
     * @param flankUnits - The units to deploy in the flanks.
     */
    private deployFlank;
    /**
     * Deploys units in the center section.
     * @param centerUnits - The units to deploy in the center.
     */
    private deployCenter;
    /**
     * Deploys units in the forward section (e.g., skirmishers).
     * @param forwardUnits - The units to deploy forward.
     */
    private deployForward;
    /**
     * Deploys units in the front section.
     * @param frontUnits - The units to deploy in the front.
     */
    private deployFront;
    /**
     * Calculates the number of additional skirmishers to spawn based on the battle type and unit composition.
     * @param gameDataManager - The game data manager instance.
     * @param units - A record mapping unit types to their counts.
     * @param dynamicBattleType - The battle type.
     * @returns The number of skirmishers to spawn.
     */
    static getSkirmishersAmount(gameDataManager: GameDataManager, units: UnitCounts, dynamicBattleType: DynamicBattleType): number;
    /**
     * Groups units by their category ID.
     * @param gameDataManager - The game data manager instance.
     * @param units - A record mapping unit types to their counts.
     * @returns A record mapping category IDs to arrays of unit types.
     */
    private getArmyCompositionByCategory;
}
export {};
