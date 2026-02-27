"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseUnit = void 0;
const entity_1 = require("@lob-sdk/entity");
const vector_1 = require("@lob-sdk/vector");
const game_data_manager_1 = require("@lob-sdk/game-data-manager");
const types_1 = require("@lob-sdk/types");
const utils_1 = require("@lob-sdk/utils");
const circle_1 = require("@lob-sdk/shapes/circle");
const unit_effects_1 = require("@lob-sdk/unit-effects");
const utils_2 = require("@lob-sdk/utils");
class BaseUnit extends entity_1.Entity {
    entityType = entity_1.EntityType.Unit;
    era;
    get totalAllyOverlap() {
        return this.hardAllyOverlap + this.softAllyOverlap;
    }
    cachedTerrain = null;
    /**
     * Temporary effects applied to the unit, along with the remaining number of ticks.
     */
    effects = new Map();
    constructor(id, era, name) {
        super(id, name);
        this.era = era;
    }
    getEffects() {
        return this.effects.values();
    }
    getEffectDtos() {
        const effectDtos = [];
        for (const effect of this.effects.values()) {
            effectDtos.push(effect.toDto());
        }
        return effectDtos;
    }
    hasEffect(effectId, inTicks) {
        if (inTicks !== undefined) {
            const effect = this.effects.get(effectId);
            return effect !== undefined && effect.duration >= inTicks;
        }
        return this.effects.has(effectId);
    }
    /**
     * Returns if the unit is ranged.
     */
    isRanged() {
        return this.rangedDamageTypes !== null;
    }
    canFireAndAdvance() {
        return this.isRanged();
    }
    getHpProportion() {
        return this.hp / this.template.hp;
    }
    getOrgProportion() {
        return this.org / this.template.org;
    }
    /**
     * Returns the power of the unit (float).
     */
    getPower() {
        const basePower = BaseUnit.getBasePower(this.template) * this.getHpProportion();
        if (this.isRouting()) {
            return basePower * 0.5;
        }
        return basePower;
    }
    get meleeDamageType() {
        return this.template.meleeDamageType;
    }
    get rangedDamageTypes() {
        if ("rangedDamageTypes" in this.template) {
            return this.template.rangedDamageTypes;
        }
        return null;
    }
    getMaxRange() {
        if (!this.rangedDamageTypes) {
            return 0;
        }
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        const { ranges } = gameDataManager.getDamageTypeByName(this.rangedDamageTypes[this.rangedDamageTypes.length - 1]);
        const { UNIT_RANGE_MARGIN } = gameDataManager.getGameConstants();
        return ranges[ranges.length - 1].end + UNIT_RANGE_MARGIN;
    }
    /**
     * Returns if the unit is routing.
     */
    isRouting() {
        return this.status === types_1.UnitStatus.Routing;
    }
    /**
     * Returns if the unit is routing or recovering.
     *
     */
    isRoutingOrRecovering() {
        return (this.status === types_1.UnitStatus.Routing ||
            this.status === types_1.UnitStatus.Recovering);
    }
    canUseOrder(orderType) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        if (orderType === types_1.OrderType.FireAndAdvance && !this.canFireAndAdvance()) {
            // Even if the unit category can fire and advance, if it's not ranged then it won't be able to use it.
            // This is to allow horse archers to use FAA and, at the same time, prevent melee cavalry from using it.
            return false;
        }
        return gameDataManager.canUseOrder(this.category, orderType);
    }
    getMeleeDamageTypeConfig() {
        return game_data_manager_1.GameDataManager.get(this.era).getDamageTypeByName(this.meleeDamageType);
    }
    getCorners() {
        // Get unit dimensions from formation template
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        const dimensions = gameDataManager.getUnitDimensions(this.type, this.currentFormation);
        // Calculate the half-width and half-height
        const halfWidth = dimensions.width / 2;
        const halfHeight = dimensions.height / 2;
        // Calculate the sin and cos of the rotation angle
        const sinAngle = Math.sin(this.rotation);
        const cosAngle = Math.cos(this.rotation);
        // Define the original corner points relative to the center
        const corners = [
            { x: -halfWidth, y: -halfHeight }, // Top-left
            { x: halfWidth, y: -halfHeight }, // Top-right
            { x: halfWidth, y: halfHeight }, // Bottom-right
            { x: -halfWidth, y: halfHeight }, // Bottom-left
        ];
        // Rotate and translate each corner point
        return corners.map((corner) => {
            const rotatedX = corner.x * cosAngle - corner.y * sinAngle;
            const rotatedY = corner.x * sinAngle + corner.y * cosAngle;
            return { x: rotatedX + this.position.x, y: rotatedY + this.position.y };
        });
    }
    getClosestCorner(unit) {
        const corners = unit.getCorners();
        let distance = Infinity;
        let closest;
        for (const corner of corners) {
            const newDistance = (0, utils_2.getSquaredDistance)(this.position, corner);
            if (newDistance < distance) {
                distance = newDistance;
                closest = corner;
            }
        }
        return closest;
    }
    getLastRangedDamageType() {
        return this.rangedDamageTypes[this.rangedDamageTypes.length - 1];
    }
    /**
     * @returns The max org a unit can have taking into account the debuffs.
     */
    calculateMaxOrg() {
        return this.template.org - this.getMaxOrgDebuff();
    }
    getBaseMaxOrg() {
        return this.template.org;
    }
    getMaxOrgDebuff() {
        return Math.round((0, utils_1.getMaxOrgProportionDebuff)(game_data_manager_1.GameDataManager.get(this.era), this.getHpProportion(), this.getStaminaProportion()) * this.template.org);
    }
    getHasRanChargeResistanceModifier() {
        return this.hasEffect(unit_effects_1.HasRan.id) ? this.runChargeResistanceModifier : 0;
    }
    static getBasePower(template) {
        return template.manpower + template.gold;
    }
    moveTo(x, y) {
        this.cachedTerrain = null;
        this.position = new vector_1.Vector2(x, y);
    }
    isReadyToCharge(accumulatedRun = this.accumulatedRun) {
        return accumulatedRun >= this.timeToRun;
    }
    isRunning(activeOrder, accumulatedRun = this.accumulatedRun) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        if (this.isRunRouting()) {
            return true;
        }
        const { stamina } = gameDataManager.getGameRules();
        return ((!stamina || this.getStaminaProportion() > stamina.lowerModifierLimit) &&
            activeOrder === types_1.OrderType.Run &&
            this.isReadyToCharge(accumulatedRun));
    }
    getStaminaProportion() {
        if (this.stamina === null || !this.template.stamina) {
            return 1; // Units without stamina are considered at full "stamina"
        }
        return this.stamina / this.template.stamina;
    }
    getMaxStamina() {
        return this.template.stamina ?? 0;
    }
    isAlly(unit) {
        return this.team === unit.team;
    }
    calculateCollisionShapes(position = this.position) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        const formationTemplate = gameDataManager
            .getFormationManager()
            .getTemplate(this.currentFormation);
        let collisionCircles;
        let collisionCircleSize;
        let collisionCircleDistance;
        let collisionCirclesVertical;
        if (formationTemplate) {
            // Use formation-specific collision data
            collisionCircles = formationTemplate.collisionCircles;
            collisionCircleSize = formationTemplate.collisionCircleSize;
            collisionCircleDistance =
                formationTemplate.collisionCircleDistance ??
                    formationTemplate.collisionCircleSize;
            collisionCirclesVertical =
                formationTemplate.collisionCirclesVertical ?? false;
        }
        else {
            // Fallback
            collisionCircles = 1;
            collisionCircleSize = 16;
            collisionCircleDistance = 16;
            collisionCirclesVertical = false;
        }
        const { x: dx, y: dy } = position;
        const radius = collisionCircleSize / 2;
        const circles = [];
        // Generate circles based on configuration
        for (let i = 0; i < collisionCircles; i++) {
            // Calculate center position for this circle
            // Space circles based on their size to create proper overlap
            let centerX = 0;
            let centerY = 0;
            if (collisionCircles > 1) {
                // Use the circle distance to determine spacing
                // For overlapping circles, space them at the specified distance
                const totalSpan = (collisionCircles - 1) * collisionCircleDistance;
                const offset = -totalSpan / 2 + i * collisionCircleDistance;
                if (collisionCirclesVertical) {
                    // Arrange circles vertically (along X axis)
                    centerX = offset;
                }
                else {
                    // Arrange circles horizontally (along Y axis) - default behavior
                    centerY = offset;
                }
            }
            const center = { x: centerX, y: centerY };
            // Use -this.rotation to reverse the rotation direction
            const cosTheta = Math.cos(-this.rotation);
            const sinTheta = Math.sin(-this.rotation);
            // Rotate center around (0, 0)
            const rotatedX = dx + center.x * cosTheta + center.y * sinTheta;
            const rotatedY = dy + -center.x * sinTheta + center.y * cosTheta;
            circles.push(new circle_1.Circle(rotatedX, rotatedY, radius));
        }
        return circles;
    }
    getCurrentFormationData() {
        if (!this.currentFormation)
            return null;
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        return gameDataManager
            .getUnitTemplateManager()
            .getFormation(this.type, this.currentFormation);
    }
    getAvailableFormations() {
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        return gameDataManager
            .getUnitTemplateManager()
            .getAvailableFormations(this.type);
    }
    getDirectionToPoint(point, frontBackArc) {
        if (frontBackArc === undefined) {
            const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
            const formation = gameDataManager
                .getFormationManager()
                .getTemplate(this.currentFormation);
            frontBackArc = formation?.frontBackArc
                ? (0, utils_1.degreesToRadians)(formation.frontBackArc)
                : (0, utils_1.degreesToRadians)(90);
        }
        return (0, utils_1.getDirectionToPoint)(this.position, point, this.rotation, frontBackArc);
    }
    canAllyCollide(ally) {
        return (!this.isRouting() &&
            !ally.isRouting() &&
            (0, utils_1.checkCollision)(ally.allyCollisionLevel, this.allyCollisionLevel));
    }
    isFriendlyFireImmune(damageType) {
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        const formationTemplate = gameDataManager
            .getFormationManager()
            .getTemplate(this.currentFormation);
        return (formationTemplate?.friendlyFireImmuneDamageTypes?.includes(damageType) ??
            false);
    }
    hasBeenAttacked() {
        return this.hasEffect(unit_effects_1.BeenInMelee.id) || this.hasEffect(unit_effects_1.TakenFire.id);
    }
    getDeploymentBuffer() {
        const { FORWARD_DEPLOYMENT_ZONE_OFFSET } = game_data_manager_1.GameDataManager.get(this.era).getGameConstants();
        return this.template.canDeployForward ? FORWARD_DEPLOYMENT_ZONE_OFFSET : 0;
    }
    /** Routing units cannot see */
    static isVisionSource(status) {
        return !status || status === types_1.UnitStatus.Standing;
    }
    addEffect(effect) {
        const existingEffect = this.effects.get(effect.id);
        if (existingEffect) {
            existingEffect.merge(effect);
        }
        else {
            this.effects.set(effect.id, effect);
            effect.onAdded(this);
        }
    }
    deleteEffect(effectId) {
        this.effects.delete(effectId);
    }
    getEffect(effectId) {
        return this.effects.get(effectId);
    }
    isRunRouting() {
        if (!this.isRouting()) {
            return false;
        }
        const gameDataManager = game_data_manager_1.GameDataManager.get(this.era);
        const categoryTemplate = gameDataManager.getUnitCategoryTemplate(this.category);
        return categoryTemplate.routingBehavior?.baseSpeed === "run";
    }
}
exports.BaseUnit = BaseUnit;
