import { UnitType, UnitCategoryId, GameScenario, ScenarioName, BattleTypeTemplate, DynamicBattleType, TerrainCategoryType, TerrainCategoryConfig, TerrainType, TerrainConfig, Size } from "@lob-sdk/types";
import { GameConstants, GameEra, UnitCategoryTemplate, DamageTypeTemplate, GameRules, UnitSkin, ObjectiveSkin, Avatar, MapSizeTemplate, MatchmakingPresetsData } from "./types";
import { OrderTemplate, OrderType } from "@lob-sdk/types";
import { FormationManager } from "./formation-manager";
import { UnitTemplateManager } from "./unit-template-manager";
/**
 * Centralized lazy-loading game data manager.
 * Provides access to all game data including units, formations, terrains, battle types, and more.
 * Uses a singleton pattern per era to ensure efficient memory usage.
 */
export declare class GameDataManager {
    readonly era: GameEra;
    private static instances;
    private battleTypes;
    private _unitTemplateManager;
    private unitCategories;
    private unitCategoryMap;
    private gameConstants;
    private gameConstantCategories;
    private avatars;
    private avatarMap;
    private damageTypes;
    private _damageTypeMap;
    private _damageTypeNameMap;
    private _chargeRestrictionsCache;
    private terrains;
    private terrainMap;
    private terrainCategories;
    private objectiveSkins;
    private objectiveSkinMap;
    private unitSkins;
    private unitSkinMap;
    private gameRules;
    private _formationManager;
    private scenarios;
    private mapSizes;
    private matchmakingPresets;
    private _unitCategoryAllowedOrders;
    private _orders;
    private _orderMap;
    private _orderNameMap;
    private _headOnCollisionCosineThresholdSquared;
    /**
     * Gets or creates a GameDataManager instance for the specified era.
     * Uses a singleton pattern to ensure only one instance exists per era.
     * @param era - The game era ("napoleonic" or "ww2").
     * @returns The GameDataManager instance for the era.
     */
    static get(era: GameEra): GameDataManager;
    /**
     * Clears all cached GameDataManager instances.
     * Useful for testing or memory management.
     */
    static clear(): void;
    static clearExcept(era: GameEra): void;
    /**
     * Creates a new GameDataManager instance for the specified era.
     * Private constructor to enforce singleton pattern via get() method.
     * @param era - The game era ("napoleonic" or "ww2").
     */
    private constructor();
    /**
     * Load all era-specific data synchronously
     */
    private loadEraData;
    /**
     * Gets a battle type template by battle type.
     * @param battleType - The dynamic battle type.
     * @returns The battle type template.
     * @throws Error if the battle type is not found.
     */
    getBattleType(battleType: DynamicBattleType): BattleTypeTemplate;
    /**
     * Tries to get a battle type template by battle type.
     * @param battleType - The dynamic battle type.
     * @returns The battle type template, or undefined if not found.
     */
    tryGetBattleType(battleType: DynamicBattleType): BattleTypeTemplate | undefined;
    /**
     * Gets the game constants for the current era.
     * @returns The game constants object.
     */
    getGameConstants(): GameConstants;
    /**
     * Gets the game rules for the current era.
     * @returns The game rules object.
     */
    getGameRules(): GameRules;
    /**
     * Gets the map sizes for the current era.
     * @returns The map sizes data.
     */
    getMapSizes(): Record<Size, MapSizeTemplate>;
    /**
     * Gets all game constant category names.
     * @returns An array of sorted category names.
     */
    getGameConstantCategories(): string[];
    /**
     * Gets the category name for a game constant key.
     * @param constantKey - The constant key to look up.
     * @returns The category name, or undefined if not found.
     */
    getGameConstantCategory(constantKey: string): string | undefined;
    /**
     * Gets all available avatars for the current era.
     * @returns An array of avatar objects.
     */
    getAvatars(): Avatar[];
    /**
     * Gets a specific avatar by ID.
     * @param avatarId - The avatar ID.
     * @returns The avatar object, or undefined if not found.
     */
    getAvatar(avatarId?: number | null): Avatar | undefined;
    /**
     * Gets all damage type templates for the current era.
     * @returns An array of damage type templates.
     */
    getDamageTypes(): DamageTypeTemplate[];
    /**
     * Gets all terrain configurations for the current era.
     * @returns An array of terrain configurations.
     */
    getTerrains(): TerrainConfig[];
    /**
     * Gets all terrain category configurations for the current era.
     * @returns A record mapping terrain category types to their configurations.
     */
    getTerrainCategories(): Record<TerrainCategoryType, TerrainCategoryConfig>;
    /**
     * Gets all objective skins for the current era.
     * @returns An array of objective skin objects.
     */
    getObjectiveSkins(): ObjectiveSkin[];
    /**
     * Gets a specific objective skin by ID.
     * @param skinId - The objective skin ID.
     * @returns The objective skin object, or undefined if not found.
     */
    getObjectiveSkin(skinId?: number): ObjectiveSkin | undefined;
    /**
     * Gets all unit skins for the current era.
     * @returns An array of unit skin objects.
     */
    getUnitSkins(): UnitSkin[];
    /**
     * Gets a specific unit skin by ID.
     * @param skinId - The unit skin ID.
     * @returns The unit skin object, or undefined if not found.
     */
    getUnitSkin(skinId?: number): UnitSkin | undefined;
    /**
     * Gets a unit category template by category ID.
     * @param unitCategory - The unit category ID.
     * @returns The unit category template.
     * @throws Error if the category template is not found.
     */
    getUnitCategoryTemplate(unitCategory: UnitCategoryId): UnitCategoryTemplate;
    /**
     * Gets all unit category templates for the current era.
     * @returns An array of unit category templates.
     */
    getUnitCategories(): UnitCategoryTemplate[];
    /**
     * Gets the unit template manager instance.
     * @returns The UnitTemplateManager instance.
     */
    getUnitTemplateManager(): UnitTemplateManager;
    /**
     * Gets the formation manager instance.
     * @returns The FormationManager instance.
     */
    getFormationManager(): FormationManager;
    getMinMaxAmmoConsumption(unitType: UnitType, modifier?: number): {
        min: number;
        max: number;
    } | null;
    /**
     * Returns the physical dimensions of a unit in the given formation.
     * Dimensions are calculated from collision shapes.
     */
    getUnitDimensions(unitType: UnitType, formationId?: string): {
        width: number;
        height: number;
    };
    getUnitBaseTexture(unitType: UnitType): string;
    getUnitOverlayTexture(unitType: UnitType): string | null;
    /**
     * Get all available eras
     */
    static getAvailableEras(): GameEra[];
    private get chargeRestrictionsCache();
    /**
     * Get damage type template by type
     */
    getDamageTypeById<T extends DamageTypeTemplate>(id: number): T;
    /**
     * Get damage type template by type
     */
    getDamageTypeByName<T extends DamageTypeTemplate>(name: string): T;
    /**
     * Get unit category resistance for a damage type
     */
    getUnitCategoryResistance(unitCategory: UnitCategoryId, damageType: string): number;
    getUnitCategoryAllowedOrders(unitCategory: UnitCategoryId): Array<OrderType>;
    canUseOrder(unitCategory: UnitCategoryId, orderType: OrderType): boolean;
    /**
     * Get charge restrictions for a damage type (O(1) lookup with lazy initialization)
     */
    getChargeRestrictions(damageType: string): Set<UnitCategoryId> | undefined;
    /**
     * Convert damage type to numeric value
     */
    damageTypeNameToId(type: string): number;
    /**
     * Convert numeric value to damage type
     */
    damageTypeIdToName(id: number): string;
    /**
     * Get terrain category by terrain type
     */
    getCategoryByTerrain(terrainType: TerrainType): TerrainCategoryType;
    /**
     * Get unit terrain attack modifier
     */
    getUnitTerrainAttackModifier(unitCategory: UnitCategoryId, terrainType: TerrainType): number;
    /**
     * Get unit terrain defense modifier
     */
    getUnitTerrainDefenseModifier(unitCategory: UnitCategoryId, terrainType: TerrainType): number;
    /**
     * Get terrain projectile absorption
     */
    getTerrainProjectileAbsorption(terrainType: TerrainType | null, damageType: string): number;
    /**
     * Get movement modifier for terrain and unit category
     */
    getMovementModifier(terrainType: TerrainType, unitCategory: UnitCategoryId): number;
    /**
     * Check if a terrain category has the prioritizeMovement flag
     */
    hasPrioritizeMovement(terrainType: TerrainType): boolean;
    /**
     * Check if a terrain category has the supplyRoute flag
     */
    hasSupplyRoute(terrainType: TerrainType): boolean;
    /**
     * Get terrain hitbox height
     */
    getTerrainHitboxHeight(terrainType: TerrainType | null): number;
    /**
     * Get ranged attack modifier for terrain and unit category
     */
    getRangedAttackModifier(terrainType: TerrainType, unitCategory: UnitCategoryId): number;
    /**
     * Check if objectives can be placed on terrain
     */
    canPlaceObjectives(terrainType: TerrainType): boolean;
    /**
     * Check if terrain is passable
     */
    isPassable(terrainType: TerrainType): boolean;
    /**
     * Get stamina cost for terrain
     */
    getStaminaCost(terrainType: TerrainType): number;
    /**
     * Get push strength modifier for terrain
     */
    getPushStrengthModifier(terrainType: TerrainType): number;
    /**
     * Get push distance modifier for terrain
     */
    getPushDistanceModifier(terrainType: TerrainType): number;
    /**
     * Get charge resistance modifier for terrain and unit category
     */
    getChargeResistanceModifier(unitCategory: UnitCategoryId, terrainType: TerrainType): number;
    /**
     * Get charge bonus modifier for terrain and unit category
     */
    getChargeBonusModifier(unitCategory: UnitCategoryId, terrainType: TerrainType): number;
    /**
     * Get fixed enemy collision level for terrain
     */
    getFixedEnemyCollisionLevel(terrainType: TerrainType): number | undefined;
    /**
     * Get terrain height offset
     */
    getTerrainHeightOffset(terrainType: TerrainType): number;
    /**
     * Get vision absorption for terrain
     */
    getVisionAbsorption(terrainType: TerrainType): number;
    /**
     * Get terrain color
     */
    getTerrainColor(terrainType: TerrainType): string | undefined;
    tryGetOrderTemplate(orderId: OrderType | null): OrderTemplate | null;
    getOrderTemplate(orderId: OrderType): OrderTemplate;
    /**
     * Get a scenario by name
     */
    getScenario<T extends GameScenario>(scenarioName: ScenarioName): T;
    /**
     * Try to get a scenario by name
     */
    tryGetScenario<T extends GameScenario>(scenarioName: ScenarioName): T | null;
    getScenarios(): Array<ScenarioName>;
    /**
     * Get all scenario names for this era
     */
    getScenarioNames(): ScenarioName[];
    /**
     * Gets the squared cosine threshold for determining head-on collisions.
     *
     * This value is computed from `HEAD_ON_COLLISION_ANGLE_DEGREES` and represents
     * the squared cosine of the maximum angle (in degrees) between a unit's movement
     * direction and the direction toward another unit for the collision to be
     * considered "head-on".
     *
     * Used in collision detection to determine collision response:
     * - If head-on: Unit velocity is reset to move directly away from collision point,
     *   preventing units from moving through each other
     * - If not head-on: No collision response (units can pass through each other)
     *
     * The squared form is used to avoid computing square roots in the collision
     * detection algorithm, which compares `dot * dot` against
     * `threshold² * movMagSq * dirMagSq`.
     *
     * The value is lazily computed and cached for performance.
     *
     * @returns The squared cosine of the head-on collision angle threshold
     */
    getHeadOnCollisionCosineThresholdSquared(): number;
    getAllDynamicBattleTypes: () => DynamicBattleType[];
    /**
     * Gets all matchmaking presets for the current era.
     * @returns An array of matchmaking preset objects.
     */
    getMatchmakingPresets(): MatchmakingPresetsData;
}
