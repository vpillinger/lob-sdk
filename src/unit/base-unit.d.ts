import { Entity, EntityType } from "@lob-sdk/entity";
import { Point2, Vector2 } from "@lob-sdk/vector";
import { EntityId, OrderType, UnitCategoryId, UnitEffectDto, UnitFormationTemplate, UnitStatus, UnitTemplate, UnitType } from "@lob-sdk/types";
import { GameEra, MeleeDamageTypeTemplate } from "@lob-sdk/game-data-manager";
import { TerrainType } from "@lob-sdk/types";
import { Circle } from "@lob-sdk/shapes/circle";
import { BaseUnitEffect } from "@lob-sdk/unit-effects";
export declare abstract class BaseUnit extends Entity {
    readonly entityType = EntityType.Unit;
    readonly era: GameEra;
    abstract hp: number;
    abstract maxHp: number;
    abstract org: number;
    abstract stamina: number | null;
    abstract ammo: number | null;
    abstract supply: number | null;
    abstract position: Vector2;
    abstract rotation: number;
    abstract walkMovement: number;
    abstract runStartUpMovement: number;
    abstract runMovement: number;
    abstract timeToRun: number;
    abstract runCost: number;
    abstract accumulatedRun: number;
    abstract category: UnitCategoryId;
    abstract template: UnitTemplate;
    abstract type: UnitType;
    abstract player: number;
    abstract team: number;
    abstract status: UnitStatus;
    abstract orgRadius: number;
    abstract orgRadiusBonus: number;
    abstract chargeResistance: number;
    abstract runChargeResistanceModifier: number;
    abstract hardAllyOverlap: number;
    abstract softAllyOverlap: number;
    get totalAllyOverlap(): number;
    abstract allyCollisionLevel: number;
    abstract enemyCollisionLevel: number;
    abstract autofirePriority: Partial<Record<UnitCategoryId, number>> | null;
    cachedTerrain: TerrainType | null;
    abstract firingAltitude: number;
    abstract entrenchment: number;
    abstract maxEntrenchment: number;
    /**
     * Current formation ID for this unit.
     */
    abstract currentFormation: string;
    abstract pendingFormationId: string | null;
    abstract formationChangeTicksRemaining: number;
    /**
     * These are the damage types that are disabled for autofire.
     * By default, all damage types are enabled for autofire. We made it this way to avoid
     * sending a lot of data over the network.
     */
    abstract holdFireDamageTypes: number[];
    abstract rotationSpeed: number;
    abstract rotationMaxThreshold: number;
    abstract runRotationSpeed: number;
    abstract turningDelay: number;
    /**
     * Temporary effects applied to the unit, along with the remaining number of ticks.
     */
    protected effects: Map<number, BaseUnitEffect>;
    abstract enfiladeFireDamageModifier: number;
    abstract enfiladeFireOrgModifier: number;
    abstract rearFireOrgModifier: number;
    abstract pushStrength: number;
    abstract pushDistance: number;
    /**
     * If true, the unit cannot change formation in the current tick.
     */
    abstract cannotChangeFormation: boolean;
    /**
     * If true, the unit cannot charge in the current tick.
     */
    abstract cannotCharge: boolean;
    /**
     * If true, the unit has attacked in the current tick.
     */
    abstract hasAttacked: boolean;
    /**
     * The reorg debuff the unit will suffer in the current tick.
     */
    abstract reorgDebuff: number;
    /**
     * Absolute organization value at which this unit shatters.
     */
    abstract shattersAtOrg: number;
    /**
     * Absolute organization value at which this unit routes.
     */
    abstract routesAtOrg: number;
    /**
     * Absolute organization value at which this unit recovers from routing.
     */
    abstract recoversAtOrg: number;
    /**
     * Absolute organization value at which this unit rallies.
     */
    abstract ralliesAtOrg: number;
    constructor(id: EntityId, era: GameEra, name?: string);
    getEffects(): MapIterator<BaseUnitEffect>;
    getEffectDtos(): UnitEffectDto[];
    hasEffect(effectId: number, inTicks?: number): boolean;
    /**
     * Returns if the unit is ranged.
     */
    isRanged(): boolean;
    canFireAndAdvance(): boolean;
    getHpProportion(): number;
    getOrgProportion(): number;
    /**
     * Returns the power of the unit (float).
     */
    getPower(): number;
    get meleeDamageType(): string;
    get rangedDamageTypes(): string[] | null;
    getMaxRange(): number;
    /**
     * Returns if the unit is routing.
     */
    isRouting(): boolean;
    /**
     * Returns if the unit is routing or recovering.
     *
     */
    isRoutingOrRecovering(): boolean;
    canUseOrder(orderType: OrderType): boolean;
    getMeleeDamageTypeConfig(): MeleeDamageTypeTemplate;
    private getCorners;
    getClosestCorner(unit: BaseUnit): Point2;
    getLastRangedDamageType(): string;
    /**
     * @returns The max org a unit can have taking into account the debuffs.
     */
    calculateMaxOrg(): number;
    getBaseMaxOrg(): number;
    getMaxOrgDebuff(): number;
    getHasRanChargeResistanceModifier(): number;
    static getBasePower(template: UnitTemplate): number;
    moveTo(x: number, y: number): void;
    isReadyToCharge(accumulatedRun?: number): boolean;
    isRunning(activeOrder: OrderType | null, accumulatedRun?: number): boolean;
    getStaminaProportion(): number;
    getMaxStamina(): number;
    isAlly(unit: BaseUnit): boolean;
    calculateCollisionShapes(position?: Vector2): Circle[];
    protected getCurrentFormationData(): UnitFormationTemplate | null;
    getAvailableFormations(): UnitFormationTemplate[];
    getDirectionToPoint(point: Vector2, frontBackArc?: number): import("@lob-sdk/types").Direction;
    canAllyCollide(ally: BaseUnit): boolean;
    isFriendlyFireImmune(damageType: string): boolean;
    hasBeenAttacked(): boolean;
    getDeploymentBuffer(): number;
    /** Routing units cannot see */
    static isVisionSource(status?: UnitStatus): status is UnitStatus.Standing | undefined;
    addEffect(effect: BaseUnitEffect): void;
    deleteEffect(effectId: number): void;
    getEffect<T extends BaseUnitEffect>(effectId: number): T | undefined;
    isRunRouting(): boolean;
    abstract isMoving(): boolean;
    abstract inMelee(): boolean;
}
