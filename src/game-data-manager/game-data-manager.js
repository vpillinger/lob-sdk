"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameDataManager = void 0;
// Import all era-specific data synchronously
const battle_types_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/battle-types.json"));
const orders_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/orders.json"));
const unit_templates_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/unit-templates.json"));
const game_constants_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/game-constants.json"));
const avatars_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/avatars.json"));
const damage_types_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/damage-types.json"));
const terrains_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/terrains.json"));
const terrain_categories_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/terrain-categories.json"));
const objective_skins_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/objective-skins.json"));
const unit_categories_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/unit-categories.json"));
const unit_skins_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/unit-skins.json"));
const game_rules_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/game-rules.json"));
const formations_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/formations.json"));
const map_sizes_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/map-sizes.json"));
const matchmaking_presets_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/matchmaking-presets.json"));
// Import napoleonic scenarios
const waterloo_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/waterloo.json"));
const hills_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/hills.json"));
const plains_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/plains.json"));
const city_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/city.json"));
const faucon_river_valley_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/faucon-river-valley.json"));
const saand_lakes_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/saand-lakes.json"));
const amnis_nucum_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/amnis-nucum.json"));
const citta_dei_falchi_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/citta-dei-falchi.json"));
const road_to_amnis_nucum_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/road-to-amnis-nucum.json"));
const rural_alpine_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/rural-alpine.json"));
const falkenhugel_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/falkenhugel.json"));
const grobes_schlachtfeld_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/grobes-schlachtfeld.json"));
const mediterranea_nucum_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/mediterranea-nucum.json"));
const river_valley_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/river-valley.json"));
const lines_of_legends_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/lines-of-legends.json"));
const aestate_villas_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/aestate-villas.json"));
const borodino_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/borodino.json"));
const combat_at_mollwitz_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/combat-at-mollwitz.json"));
const clash_at_chelmnitz_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/clash-at-chelmnitz.json"));
const tundra_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/tundra.json"));
const dresden_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/dresden.json"));
const black_forest_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/black-forest.json"));
const lake_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/lake.json"));
const antioch_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/antioch.json"));
const silva_sanctorum_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/silva-sanctorum.json"));
const andes_and_valley_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/andes-and-valley.json"));
const low_countries_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/low-countries.json"));
const hedgerows_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/hedgerows.json"));
const tutorial_basic_controls_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/tutorial-basic-controls.json"));
const tutorial_control_groups_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/tutorial-control-groups.json"));
const tutorial_infantry_formations_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/tutorial-infantry-formations.json"));
const tutorial_unit_management_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/tutorial-unit-management.json"));
const tutorial_charges_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/tutorial-charges.json"));
const tutorial_hold_fire_json_1 = __importDefault(require("@lob-sdk/game-data/eras/napoleonic/scenarios/tutorial-hold-fire.json"));
const battle_types_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/battle-types.json"));
const orders_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/orders.json"));
const unit_templates_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/unit-templates.json"));
const game_constants_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/game-constants.json"));
const avatars_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/avatars.json"));
const damage_types_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/damage-types.json"));
const terrains_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/terrains.json"));
const terrain_categories_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/terrain-categories.json"));
const objective_skins_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/objective-skins.json"));
const unit_categories_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/unit-categories.json"));
const unit_skins_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/unit-skins.json"));
const game_rules_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/game-rules.json"));
const formations_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/formations.json"));
const map_sizes_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/map-sizes.json"));
const matchmaking_presets_json_2 = __importDefault(require("@lob-sdk/game-data/eras/ww2/matchmaking-presets.json"));
// Import ww2 scenarios
const battle_of_moscow_json_1 = __importDefault(require("@lob-sdk/game-data/eras/ww2/scenarios/battle-of-moscow.json"));
const fields_json_1 = __importDefault(require("@lob-sdk/game-data/eras/ww2/scenarios/fields.json"));
const battle_of_france_json_1 = __importDefault(require("@lob-sdk/game-data/eras/ww2/scenarios/battle-of-france.json"));
// Shared
const game_constant_categories_json_1 = __importDefault(require("@lob-sdk/game-data/shared/game-constant-categories.json"));
const formation_manager_1 = require("./formation-manager");
const unit_template_manager_1 = require("./unit-template-manager");
const utils_1 = require("@lob-sdk/utils");
/**
 * Centralized lazy-loading game data manager.
 * Provides access to all game data including units, formations, terrains, battle types, and more.
 * Uses a singleton pattern per era to ensure efficient memory usage.
 */
class GameDataManager {
    era;
    static instances = new Map();
    // Centralized data cache
    battleTypes = {};
    // Unit templates
    _unitTemplateManager = new unit_template_manager_1.UnitTemplateManager();
    // Unit categories
    unitCategories = [];
    unitCategoryMap = new Map();
    // Game constants
    gameConstants = null;
    // Game constant categories
    gameConstantCategories = {};
    // Avatars
    avatars = [];
    avatarMap = new Map();
    // Damage types
    damageTypes = [];
    _damageTypeMap = new Map();
    _damageTypeNameMap = new Map();
    _chargeRestrictionsCache = null;
    // Terrains
    terrains = [];
    terrainMap = new Map();
    // Terrain categories
    terrainCategories = null;
    // Objective skins
    objectiveSkins = [];
    objectiveSkinMap = new Map();
    // Unit skins
    unitSkins = [];
    unitSkinMap = new Map();
    // Game rules
    gameRules = null;
    // Formations
    _formationManager = new formation_manager_1.FormationManager();
    // Scenarios
    scenarios = {};
    // Map sizes
    mapSizes = null;
    // Matchmaking presets
    matchmakingPresets = null;
    _unitCategoryAllowedOrders = new Map();
    _orders = [];
    _orderMap = new Map();
    _orderNameMap = new Map();
    _headOnCollisionCosineThresholdSquared = -1;
    /**
     * Gets or creates a GameDataManager instance for the specified era.
     * Uses a singleton pattern to ensure only one instance exists per era.
     * @param era - The game era ("napoleonic" or "ww2").
     * @returns The GameDataManager instance for the era.
     */
    static get(era) {
        if (!GameDataManager.instances.has(era)) {
            const instance = new GameDataManager(era);
            GameDataManager.instances.set(era, instance);
        }
        return GameDataManager.instances.get(era);
    }
    /**
     * Clears all cached GameDataManager instances.
     * Useful for testing or memory management.
     */
    static clear() {
        GameDataManager.instances.clear();
    }
    static clearExcept(era) {
        GameDataManager.instances.forEach((_, key) => {
            if (key !== era) {
                GameDataManager.instances.delete(key);
            }
        });
    }
    /**
     * Creates a new GameDataManager instance for the specified era.
     * Private constructor to enforce singleton pattern via get() method.
     * @param era - The game era ("napoleonic" or "ww2").
     */
    constructor(era) {
        this.era = era;
        this.loadEraData(era);
        // Initialize shared data that doesn't depend on era
        this.gameConstantCategories = game_constant_categories_json_1.default;
    }
    /**
     * Load all era-specific data synchronously
     */
    loadEraData(era) {
        // Load data based on era
        switch (era) {
            case "napoleonic":
                this._orders = orders_json_1.default;
                this.battleTypes = battle_types_json_1.default;
                this._unitTemplateManager.load(unit_templates_json_1.default);
                this.gameConstants = game_constants_json_1.default;
                this.avatars = avatars_json_1.default;
                this.damageTypes = damage_types_json_1.default;
                this.terrains = terrains_json_1.default;
                this.terrainCategories = terrain_categories_json_1.default;
                this.objectiveSkins = objective_skins_json_1.default;
                this.unitCategories =
                    unit_categories_json_1.default;
                this.unitSkins = unit_skins_json_1.default;
                this.gameRules = game_rules_json_1.default;
                this._formationManager.load(formations_json_1.default);
                this.mapSizes = map_sizes_json_1.default;
                this.matchmakingPresets =
                    matchmaking_presets_json_1.default;
                this.scenarios = {
                    plains: plains_json_1.default,
                    hills: hills_json_1.default,
                    city: city_json_1.default,
                    hedgerows: hedgerows_json_1.default,
                    "low-countries": low_countries_json_1.default,
                    lake: lake_json_1.default,
                    tundra: tundra_json_1.default,
                    "black-forest": black_forest_json_1.default,
                    "silva-sanctorum": silva_sanctorum_json_1.default,
                    "andes-and-valley": andes_and_valley_json_1.default,
                    "lines-of-legends": lines_of_legends_json_1.default,
                    "river-valley": river_valley_json_1.default,
                    "saand-lakes": saand_lakes_json_1.default,
                    "faucon-river-valley": faucon_river_valley_json_1.default,
                    "amnis-nucum": amnis_nucum_json_1.default,
                    "road-to-amnis-nucum": road_to_amnis_nucum_json_1.default,
                    "aestate-villas": aestate_villas_json_1.default,
                    "citta-dei-falchi": citta_dei_falchi_json_1.default,
                    "rural-alpine": rural_alpine_json_1.default,
                    "mediterranea-nucum": mediterranea_nucum_json_1.default,
                    falkenhugel: falkenhugel_json_1.default,
                    "grobes-schlachtfeld": grobes_schlachtfeld_json_1.default,
                    antioch: antioch_json_1.default,
                    waterloo: waterloo_json_1.default,
                    borodino: borodino_json_1.default,
                    "combat-at-mollwitz": combat_at_mollwitz_json_1.default,
                    "clash-at-chelmnitz": clash_at_chelmnitz_json_1.default,
                    dresden: dresden_json_1.default,
                    "tutorial-basic-controls": tutorial_basic_controls_json_1.default,
                    "tutorial-control-groups": tutorial_control_groups_json_1.default,
                    "tutorial-infantry-formations": tutorial_infantry_formations_json_1.default,
                    "tutorial-unit-management": tutorial_unit_management_json_1.default,
                    "tutorial-charges": tutorial_charges_json_1.default,
                    "tutorial-hold-fire": tutorial_hold_fire_json_1.default,
                };
                break;
            case "ww2":
                this._orders = orders_json_2.default;
                this.battleTypes = battle_types_json_2.default;
                this._unitTemplateManager.load(unit_templates_json_2.default);
                this.gameConstants = game_constants_json_2.default;
                this.avatars = avatars_json_2.default;
                this.damageTypes = damage_types_json_2.default;
                this.terrains = terrains_json_2.default;
                this.terrainCategories =
                    terrain_categories_json_2.default;
                this.objectiveSkins = objective_skins_json_2.default;
                this.unitCategories = unit_categories_json_2.default;
                this.unitSkins = unit_skins_json_2.default;
                this.gameRules = game_rules_json_2.default;
                this._formationManager.load(formations_json_2.default);
                this.mapSizes = map_sizes_json_2.default;
                this.matchmakingPresets =
                    matchmaking_presets_json_2.default;
                this.scenarios = {
                    fields: fields_json_1.default,
                    "battle-of-france": battle_of_france_json_1.default,
                    "battle-of-moscow": battle_of_moscow_json_1.default,
                };
                break;
            default:
                throw new Error(`Unsupported era: ${era}`);
        }
        this._orders.forEach((order) => {
            this._orderMap.set(order.id, order);
            this._orderNameMap.set(order.name, order.id);
        });
        this.terrains.forEach((terrain) => {
            this.terrainMap.set(terrain.id, terrain);
        });
        this.unitCategories.forEach((category) => {
            this.unitCategoryMap.set(category.id, category);
            if (category.allowedOrders) {
                this._unitCategoryAllowedOrders.set(category.id, new Set(category.allowedOrders.map((order) => {
                    const orderType = this._orderNameMap.get(order);
                    if (orderType !== undefined) {
                        return orderType;
                    }
                    throw new Error(`Order ${order} not found`);
                })));
            }
        });
        // Build avatar map for O(1) lookup
        this.avatarMap = new Map(this.avatars.map((a) => [a.id, a]));
        this.objectiveSkins.forEach((objectiveSkin) => {
            this.objectiveSkinMap.set(objectiveSkin.id, objectiveSkin);
        });
        this.unitSkins.forEach((unitSkin) => {
            this.unitSkinMap.set(unitSkin.id, unitSkin);
        });
        // Initialize damage type mappings
        this.damageTypes.forEach((damageType) => {
            this._damageTypeMap.set(damageType.id, damageType);
            this._damageTypeNameMap.set(damageType.name, damageType);
        });
    }
    /**
     * Gets a battle type template by battle type.
     * @param battleType - The dynamic battle type.
     * @returns The battle type template.
     * @throws Error if the battle type is not found.
     */
    getBattleType(battleType) {
        const battleTypeData = this.battleTypes[battleType];
        if (!battleTypeData) {
            throw new Error(`Battle type ${battleType} not found`);
        }
        return battleTypeData;
    }
    /**
     * Tries to get a battle type template by battle type.
     * @param battleType - The dynamic battle type.
     * @returns The battle type template, or undefined if not found.
     */
    tryGetBattleType(battleType) {
        return this.battleTypes[battleType];
    }
    /**
     * Gets the game constants for the current era.
     * @returns The game constants object.
     */
    getGameConstants() {
        return this.gameConstants;
    }
    /**
     * Gets the game rules for the current era.
     * @returns The game rules object.
     */
    getGameRules() {
        return this.gameRules;
    }
    /**
     * Gets the map sizes for the current era.
     * @returns The map sizes data.
     */
    getMapSizes() {
        if (!this.mapSizes) {
            throw new Error(`Map sizes not loaded for era: ${this.era}`);
        }
        return this.mapSizes;
    }
    /**
     * Gets all game constant category names.
     * @returns An array of sorted category names.
     */
    getGameConstantCategories() {
        const categories = new Set();
        Object.values(this.gameConstantCategories).forEach((category) => {
            categories.add(category);
        });
        return Array.from(categories).sort();
    }
    /**
     * Gets the category name for a game constant key.
     * @param constantKey - The constant key to look up.
     * @returns The category name, or undefined if not found.
     */
    getGameConstantCategory(constantKey) {
        return this.gameConstantCategories[constantKey];
    }
    /**
     * Gets all available avatars for the current era.
     * @returns An array of avatar objects.
     */
    getAvatars() {
        return this.avatars;
    }
    /**
     * Gets a specific avatar by ID.
     * @param avatarId - The avatar ID.
     * @returns The avatar object, or undefined if not found.
     */
    getAvatar(avatarId) {
        return this.avatarMap.get(avatarId);
    }
    /**
     * Gets all damage type templates for the current era.
     * @returns An array of damage type templates.
     */
    getDamageTypes() {
        return this.damageTypes;
    }
    /**
     * Gets all terrain configurations for the current era.
     * @returns An array of terrain configurations.
     */
    getTerrains() {
        return this.terrains;
    }
    /**
     * Gets all terrain category configurations for the current era.
     * @returns A record mapping terrain category types to their configurations.
     */
    getTerrainCategories() {
        return this.terrainCategories;
    }
    /**
     * Gets all objective skins for the current era.
     * @returns An array of objective skin objects.
     */
    getObjectiveSkins() {
        return this.objectiveSkins;
    }
    /**
     * Gets a specific objective skin by ID.
     * @param skinId - The objective skin ID.
     * @returns The objective skin object, or undefined if not found.
     */
    getObjectiveSkin(skinId) {
        return this.objectiveSkinMap.get(skinId);
    }
    /**
     * Gets all unit skins for the current era.
     * @returns An array of unit skin objects.
     */
    getUnitSkins() {
        return this.unitSkins;
    }
    /**
     * Gets a specific unit skin by ID.
     * @param skinId - The unit skin ID.
     * @returns The unit skin object, or undefined if not found.
     */
    getUnitSkin(skinId) {
        return this.unitSkinMap.get(skinId);
    }
    /**
     * Gets a unit category template by category ID.
     * @param unitCategory - The unit category ID.
     * @returns The unit category template.
     * @throws Error if the category template is not found.
     */
    getUnitCategoryTemplate(unitCategory) {
        const template = this.unitCategoryMap.get(unitCategory);
        if (!template) {
            throw new Error(`Unit category template with type ${unitCategory} not found`);
        }
        // Provide default routing behavior if not specified
        if (!template.routingBehavior) {
            template.routingBehavior = {
                baseSpeed: "run",
                fleeWhenRouted: true,
            };
        }
        return template;
    }
    /**
     * Gets all unit category templates for the current era.
     * @returns An array of unit category templates.
     */
    getUnitCategories() {
        return this.unitCategories;
    }
    /**
     * Gets the unit template manager instance.
     * @returns The UnitTemplateManager instance.
     */
    getUnitTemplateManager() {
        return this._unitTemplateManager;
    }
    /**
     * Gets the formation manager instance.
     * @returns The FormationManager instance.
     */
    getFormationManager() {
        return this._formationManager;
    }
    getMinMaxAmmoConsumption(unitType, modifier = 0) {
        const { rangedDamageTypes } = this._unitTemplateManager.getTemplate(unitType);
        if (!rangedDamageTypes) {
            return null;
        }
        let min = null;
        let max = null;
        for (const damageType of rangedDamageTypes) {
            let { ammoCost } = this.getDamageTypeByName(damageType);
            if (ammoCost !== undefined) {
                // Apply modifier to ammo cost
                ammoCost *= 1 + modifier;
                min = Math.round(Math.min(min ?? Number.MAX_SAFE_INTEGER, ammoCost));
                max = Math.round(Math.max(max ?? Number.MIN_SAFE_INTEGER, ammoCost));
            }
        }
        if (min === null || max === null) {
            return null;
        }
        return { min, max };
    }
    /**
     * Returns the physical dimensions of a unit in the given formation.
     * Dimensions are calculated from collision shapes.
     */
    getUnitDimensions(unitType, formationId) {
        const template = this._unitTemplateManager.getTemplate(unitType);
        formationId = formationId ?? template.defaultFormation;
        // Get dimensions from formation template
        const formationTemplate = this._formationManager.getTemplate(formationId);
        if (formationTemplate) {
            const collisionCircles = formationTemplate.collisionCircles;
            const collisionCircleSize = formationTemplate.collisionCircleSize;
            const collisionCircleDistance = formationTemplate.collisionCircleDistance ?? collisionCircleSize;
            const collisionCirclesVertical = formationTemplate.collisionCirclesVertical ?? false;
            // Calculate the span of all collision circles
            const span = collisionCircles > 1
                ? (collisionCircles - 1) * collisionCircleDistance +
                    collisionCircleSize
                : collisionCircleSize;
            if (collisionCirclesVertical) {
                return {
                    width: span,
                    height: collisionCircleSize,
                };
            }
            return {
                width: collisionCircleSize,
                height: span,
            };
        }
        // Fallback
        return { width: 32, height: 32 };
    }
    getUnitBaseTexture(unitType) {
        const template = this._unitTemplateManager.getTemplate(unitType);
        // Get sprite from default formation
        const defaultFormation = template.formations.find((f) => f.id === template.defaultFormation);
        if (defaultFormation) {
            return defaultFormation.baseSprite;
        }
        // Fallback
        return "unknown";
    }
    getUnitOverlayTexture(unitType) {
        const template = this._unitTemplateManager.getTemplate(unitType);
        // Get sprite from default formation
        const defaultFormation = template.formations.find((f) => f.id === template.defaultFormation);
        if (defaultFormation) {
            return defaultFormation.overlaySprite || null;
        }
        // Fallback
        return null;
    }
    /**
     * Get all available eras
     */
    static getAvailableEras() {
        return ["napoleonic", "ww2"];
    }
    // Damage type methods (moved from DamageTypeService)
    get chargeRestrictionsCache() {
        if (!this._chargeRestrictionsCache) {
            this._chargeRestrictionsCache = new Map();
        }
        return this._chargeRestrictionsCache;
    }
    /**
     * Get damage type template by type
     */
    getDamageTypeById(id) {
        const template = this._damageTypeMap.get(id);
        if (!template) {
            throw new Error(`Damage type with id ${id} not found`);
        }
        return template;
    }
    /**
     * Get damage type template by type
     */
    getDamageTypeByName(name) {
        const template = this._damageTypeNameMap.get(name);
        if (!template) {
            throw new Error(`Damage type with name ${name} not found`);
        }
        return template;
    }
    /**
     * Get unit category resistance for a damage type
     */
    getUnitCategoryResistance(unitCategory, damageType) {
        return (this.getUnitCategoryTemplate(unitCategory).damageTypeResistances?.[damageType] ?? 0);
    }
    getUnitCategoryAllowedOrders(unitCategory) {
        return Array.from(this._unitCategoryAllowedOrders.get(unitCategory) ?? []);
    }
    canUseOrder(unitCategory, orderType) {
        return (this._unitCategoryAllowedOrders.get(unitCategory)?.has(orderType) ?? false);
    }
    /**
     * Get charge restrictions for a damage type (O(1) lookup with lazy initialization)
     */
    getChargeRestrictions(damageType) {
        // Check cache first
        if (this.chargeRestrictionsCache.has(damageType)) {
            return this.chargeRestrictionsCache.get(damageType);
        }
        // Get the damage type config
        const damageTypeConfig = this.getDamageTypeByName(damageType);
        // Only melee damage types can have charge restrictions
        if (!damageTypeConfig.ranged &&
            damageTypeConfig.cannotChargeAgainst) {
            const restrictions = new Set(damageTypeConfig.cannotChargeAgainst);
            this.chargeRestrictionsCache.set(damageType, restrictions);
            return restrictions;
        }
        // Cache undefined for damage types without restrictions
        this.chargeRestrictionsCache.set(damageType, undefined);
        return undefined;
    }
    /**
     * Convert damage type to numeric value
     */
    damageTypeNameToId(type) {
        const template = this._damageTypeNameMap.get(type);
        if (!template) {
            throw new Error(`Damage type with name ${type} not found`);
        }
        return template.id;
    }
    /**
     * Convert numeric value to damage type
     */
    damageTypeIdToName(id) {
        const template = this._damageTypeMap.get(id);
        if (!template) {
            throw new Error(`Damage type with id ${id} not found`);
        }
        return template.name;
    }
    /**
     * Get terrain category by terrain type
     */
    getCategoryByTerrain(terrainType) {
        return this.terrainMap.get(terrainType).category; // TODO: replace map with an array. Map is too slow.
        // For Leo: all of these checks for terrain category slow everything down because it prevents everything from being optimized and cached by the compiler/CPU.
        // The "terrain" file doesn't do anything, so just consolidate it to one config. If you really don't want to do that, at least build all the terrains/categories on initialization and don't have a check every time you look up a tile.
    }
    /**
     * Get unit terrain attack modifier
     */
    getUnitTerrainAttackModifier(unitCategory, terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.attackModifier?.[unitCategory] ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get unit terrain defense modifier
     */
    getUnitTerrainDefenseModifier(unitCategory, terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.defenseModifier?.[unitCategory] ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get terrain projectile absorption
     */
    getTerrainProjectileAbsorption(terrainType, damageType) {
        if (terrainType === null) {
            return 0;
        }
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.projectileAbsorption?.[damageType] ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get movement modifier for terrain and unit category
     */
    getMovementModifier(terrainType, unitCategory) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.movementModifier?.[unitCategory] ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Check if a terrain category has the prioritizeMovement flag
     */
    hasPrioritizeMovement(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.prioritizeMovement ?? false; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Check if a terrain category has the supplyRoute flag
     */
    hasSupplyRoute(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.supplyRoute ?? false; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get terrain hitbox height
     */
    getTerrainHitboxHeight(terrainType) {
        if (terrainType === null) {
            return 0;
        }
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.hitboxHeight ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get ranged attack modifier for terrain and unit category
     */
    getRangedAttackModifier(terrainType, unitCategory) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.rangedAttackModifier?.[unitCategory] ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Check if objectives can be placed on terrain
     */
    canPlaceObjectives(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return !!terrainCategory?.canPlaceObjectives; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Check if terrain is passable
     */
    isPassable(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return !terrainCategory?.impassable; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get stamina cost for terrain
     */
    getStaminaCost(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.staminaCostModifier ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get push strength modifier for terrain
     */
    getPushStrengthModifier(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.pushStrengthModifier ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get push distance modifier for terrain
     */
    getPushDistanceModifier(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.pushDistanceModifier ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get charge resistance modifier for terrain and unit category
     */
    getChargeResistanceModifier(unitCategory, terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.chargeResistanceModifier?.[unitCategory] ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get charge bonus modifier for terrain and unit category
     */
    getChargeBonusModifier(unitCategory, terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.chargeBonusModifier?.[unitCategory] ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get fixed enemy collision level for terrain
     */
    getFixedEnemyCollisionLevel(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.fixedEnemyCollisionLevel; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get terrain height offset
     */
    getTerrainHeightOffset(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.heightOffset ?? 0; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get vision absorption for terrain
     */
    getVisionAbsorption(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.visionAbsorption ?? 1; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    /**
     * Get terrain color
     */
    getTerrainColor(terrainType) {
        const category = this.getCategoryByTerrain(terrainType);
        const terrainCategory = this.terrainCategories[category]; // This indirection on lookup is painful, becuase its done many times. Replace with direct lookup
        return terrainCategory?.color; // these conditionals cause big-suck on performance, set defaults at initialization
    }
    tryGetOrderTemplate(orderId) {
        return this._orderMap.get(orderId) ?? null;
    }
    getOrderTemplate(orderId) {
        return this._orderMap.get(orderId);
    }
    /**
     * Get a scenario by name
     */
    getScenario(scenarioName) {
        const scenario = this.scenarios[scenarioName];
        if (!scenario) {
            throw new Error(`Scenario ${scenarioName} not found for era ${this.era}`);
        }
        return scenario;
    }
    /**
     * Try to get a scenario by name
     */
    tryGetScenario(scenarioName) {
        const scenario = this.scenarios[scenarioName];
        return (scenario ?? null);
    }
    getScenarios() {
        return Object.keys(this.scenarios).filter((scenarioName) => {
            const scenario = this.scenarios[scenarioName];
            return !scenario.hidden;
        });
    }
    /**
     * Get all scenario names for this era
     */
    getScenarioNames() {
        return Object.keys(this.scenarios);
    }
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
    getHeadOnCollisionCosineThresholdSquared() {
        if (this._headOnCollisionCosineThresholdSquared !== -1) {
            return this._headOnCollisionCosineThresholdSquared;
        }
        const value = Math.cos((0, utils_1.degreesToRadians)(this.gameConstants.HEAD_ON_COLLISION_ANGLE_DEGREES)) ** 2;
        this._headOnCollisionCosineThresholdSquared = value;
        return value;
    }
    getAllDynamicBattleTypes = () => {
        return Object.keys(this.battleTypes);
    };
    /**
     * Gets all matchmaking presets for the current era.
     * @returns An array of matchmaking preset objects.
     */
    getMatchmakingPresets() {
        return this.matchmakingPresets;
    }
}
exports.GameDataManager = GameDataManager;
