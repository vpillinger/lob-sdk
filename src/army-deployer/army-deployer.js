"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmyDeployer = void 0;
const utils_1 = require("@lob-sdk/utils");
/**
 * Handles the deployment of units within a deployment zone, organizing them into sections
 * (flank, center, forward, front) based on their unit categories.
 */
class ArmyDeployer {
    gameDataManager;
    DEFAULT_UNIT_HEIGHT = 24;
    MIN_SPACING = 8;
    MARGIN = 12;
    units;
    deploymentZone;
    player;
    team;
    dynamicBattleType;
    unitDtos = [];
    metrics;
    rotation;
    forwardDeploymentZoneOffset;
    /**
     * Creates a new ArmyDeployer instance.
     * @param gameDataManager - The game data manager instance.
     * @param units - A record mapping unit types to their counts.
     * @param deploymentZone - The zone where units should be deployed.
     * @param player - The player number.
     * @param team - The team number (1 or 2).
     * @param dynamicBattleType - The battle type (defaults to Combat).
     */
    constructor(gameDataManager, units, deploymentZone, player, team, dynamicBattleType) {
        this.gameDataManager = gameDataManager;
        this.units = units;
        this.deploymentZone = deploymentZone;
        this.player = player;
        this.team = team;
        this.dynamicBattleType = dynamicBattleType ?? gameDataManager.getGameConstants().DEFAULT_BATTLE_TYPE;
        this.rotation =
            this.team === 1 ? 270 * (Math.PI / 180) : 90 * (Math.PI / 180);
        this.metrics = this.calculateSectionMetrics();
        const { FORWARD_DEPLOYMENT_ZONE_OFFSET = 0 } = gameDataManager.getGameConstants();
        this.forwardDeploymentZoneOffset = FORWARD_DEPLOYMENT_ZONE_OFFSET;
    }
    /**
     * Deploys all units in the deployment zone according to their categories and deployment sections.
     * @returns An array of unit DTOs with their positions and rotations set.
     */
    deploy() {
        const unitsByCategory = this.getArmyCompositionByCategory(this.gameDataManager, this.units);
        // Group units by deployment section in a single pass for efficiency
        const unitsByDeploymentSection = this.groupUnitsByDeploymentSection(unitsByCategory);
        this.deployFlank(unitsByDeploymentSection.flank);
        this.deployCenter(unitsByDeploymentSection.center);
        this.deployForward(unitsByDeploymentSection.forward);
        this.deployFront(unitsByDeploymentSection.front);
        return this.unitDtos;
    }
    /**
     * Groups units by deployment section in a single pass for efficiency.
     * This avoids iterating through categories multiple times.
     */
    groupUnitsByDeploymentSection(unitsByCategory) {
        const grouped = {
            flank: [],
            center: [],
            forward: [],
            front: [],
        };
        // Single iteration through all categories
        for (const categoryId in unitsByCategory) {
            const categoryTemplate = this.gameDataManager.getUnitCategoryTemplate(categoryId);
            const templateDeploymentSection = categoryTemplate.deploymentSection ?? "center";
            const categoryUnits = unitsByCategory[categoryId] ?? [];
            grouped[templateDeploymentSection].push(...categoryUnits);
        }
        return grouped;
    }
    /**
     * Adds a unit to the deployment list at the specified position.
     * @param type - The unit type to deploy.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     */
    addUnit(type, x, y) {
        const template = this.gameDataManager
            .getUnitTemplateManager()
            .getTemplate(type);
        // Apply a buffer for units that can deploy forward
        let buffer = 0;
        if (template.canDeployForward) {
            buffer = this.forwardDeploymentZoneOffset;
        }
        this.unitDtos.push({
            player: this.player,
            pos: (0, utils_1.getClosestPointInsideZone)(this.deploymentZone, { x, y }, buffer),
            rotation: this.rotation,
            type,
        });
    }
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
    deployUnitsInLines(units, baseY, startX, sectionWidth, maxUnitsPerRow, spacing, reverseY) {
        const unitCount = units.length;
        const lines = Math.ceil(unitCount / maxUnitsPerRow);
        for (let lineIndex = 0; lineIndex < lines; lineIndex++) {
            const unitsInLine = Math.min(maxUnitsPerRow, unitCount - lineIndex * maxUnitsPerRow);
            const totalLineWidth = unitsInLine * (this.DEFAULT_UNIT_HEIGHT + spacing) - spacing;
            const lineStartX = startX + (sectionWidth - totalLineWidth) / 2;
            for (let i = 0; i < unitsInLine; i++) {
                const unitIndex = lineIndex * maxUnitsPerRow + i;
                const unitType = units[unitIndex];
                const template = this.gameDataManager
                    .getUnitTemplateManager()
                    .getTemplate(unitType);
                const deploymentBuffer = template.canDeployForward
                    ? this.forwardDeploymentZoneOffset
                    : 0;
                const posX = lineStartX + i * (this.DEFAULT_UNIT_HEIGHT + spacing);
                const posY = reverseY
                    ? baseY -
                        lineIndex * (this.DEFAULT_UNIT_HEIGHT + this.MARGIN) +
                        deploymentBuffer
                    : baseY +
                        lineIndex * (this.DEFAULT_UNIT_HEIGHT + this.MARGIN) -
                        deploymentBuffer;
                this.addUnit(unitType, posX, posY);
            }
        }
    }
    /**
     * Calculates metrics for each deployment section (left flank, center, right flank).
     * @returns A SectionMetrics object containing calculated dimensions and positions.
     */
    calculateSectionMetrics() {
        const { x, y, width, height } = this.deploymentZone;
        const leftFlankWidth = width * 0.25;
        const centerWidth = width * 0.5;
        const rightFlankWidth = width * 0.25;
        const leftFlankStartX = x;
        const centerStartX = x + leftFlankWidth;
        const rightFlankStartX = x + leftFlankWidth + centerWidth;
        // Ensure at least one unit if the section width can accommodate a unit
        const leftFlankMaxUnits = Math.max(1, Math.floor(leftFlankWidth / (this.DEFAULT_UNIT_HEIGHT + this.MIN_SPACING)));
        const centerMaxUnits = Math.max(1, Math.floor(centerWidth / (this.DEFAULT_UNIT_HEIGHT + this.MIN_SPACING)));
        const rightFlankMaxUnits = Math.max(1, Math.floor(rightFlankWidth / (this.DEFAULT_UNIT_HEIGHT + this.MIN_SPACING)));
        // Adjust spacing to prevent negative values
        const leftFlankSpacing = leftFlankMaxUnits > 0
            ? Math.max(this.MIN_SPACING, (leftFlankWidth - leftFlankMaxUnits * this.DEFAULT_UNIT_HEIGHT) /
                (leftFlankMaxUnits > 1 ? leftFlankMaxUnits - 1 : 1))
            : this.MIN_SPACING;
        const centerSpacing = centerMaxUnits > 0
            ? Math.max(this.MIN_SPACING, (centerWidth - centerMaxUnits * this.DEFAULT_UNIT_HEIGHT) /
                (centerMaxUnits > 1 ? centerMaxUnits - 1 : 1))
            : this.MIN_SPACING;
        const rightFlankSpacing = rightFlankMaxUnits > 0
            ? Math.max(this.MIN_SPACING, (rightFlankWidth - rightFlankMaxUnits * this.DEFAULT_UNIT_HEIGHT) /
                (rightFlankMaxUnits > 1 ? rightFlankMaxUnits - 1 : 1))
            : this.MIN_SPACING;
        const topY = this.team === 1 ? y + this.MARGIN : y + height - this.MARGIN;
        const centerY = this.team === 1 ? topY + this.MARGIN : topY - this.MARGIN;
        const forwardY = this.team === 1 ? topY - this.MARGIN : topY + this.MARGIN;
        const frontY = this.team === 1 ? topY - this.MARGIN : topY + this.MARGIN;
        const flankY = this.team === 1 ? topY - this.MARGIN : topY + this.MARGIN;
        return {
            leftFlankWidth,
            centerWidth,
            rightFlankWidth,
            leftFlankStartX,
            centerStartX,
            rightFlankStartX,
            leftFlankMaxUnits,
            centerMaxUnits,
            rightFlankMaxUnits,
            leftFlankSpacing,
            centerSpacing,
            rightFlankSpacing,
            centerY,
            forwardY,
            frontY,
            flankY,
        };
    }
    /**
     * Deploys units in the flank sections (left and right).
     * @param flankUnits - The units to deploy in the flanks.
     */
    deployFlank(flankUnits) {
        const unitsWithBuffer = [];
        const unitsWithoutBuffer = [];
        flankUnits.forEach((type) => {
            const template = this.gameDataManager
                .getUnitTemplateManager()
                .getTemplate(type);
            if (template.canDeployForward) {
                unitsWithBuffer.push(type);
            }
            else {
                unitsWithoutBuffer.push(type);
            }
        });
        const [flankLeft, flankRight] = (0, utils_1.divideArrayInHalf)(unitsWithoutBuffer);
        const [lightFlankLeft, lightFlankRight] = (0, utils_1.divideArrayInHalf)(unitsWithBuffer);
        this.deployUnitsInLines(flankLeft, this.metrics.flankY, this.metrics.leftFlankStartX, this.metrics.leftFlankWidth, this.metrics.leftFlankMaxUnits, this.metrics.leftFlankSpacing, this.team !== 1);
        this.deployUnitsInLines(flankRight, this.metrics.flankY, this.metrics.rightFlankStartX, this.metrics.rightFlankWidth, this.metrics.rightFlankMaxUnits, this.metrics.rightFlankSpacing, this.team !== 1);
        this.deployUnitsInLines(lightFlankLeft, this.metrics.flankY, this.metrics.leftFlankStartX, this.metrics.leftFlankWidth, this.metrics.leftFlankMaxUnits, this.metrics.leftFlankSpacing, this.team !== 1);
        this.deployUnitsInLines(lightFlankRight, this.metrics.flankY, this.metrics.rightFlankStartX, this.metrics.rightFlankWidth, this.metrics.rightFlankMaxUnits, this.metrics.rightFlankSpacing, this.team !== 1);
    }
    /**
     * Deploys units in the center section.
     * @param centerUnits - The units to deploy in the center.
     */
    deployCenter(centerUnits) {
        const unitsWithBuffer = [];
        const unitsWithoutBuffer = [];
        centerUnits.forEach((type) => {
            const template = this.gameDataManager
                .getUnitTemplateManager()
                .getTemplate(type);
            if (template.canDeployForward) {
                unitsWithBuffer.push(type);
            }
            else {
                unitsWithoutBuffer.push(type);
            }
        });
        this.deployUnitsInLines(unitsWithBuffer, this.metrics.centerY, this.metrics.centerStartX, this.metrics.centerWidth, this.metrics.centerMaxUnits, this.metrics.centerSpacing, this.team !== 1);
        this.deployUnitsInLines(unitsWithoutBuffer, this.metrics.centerY, this.metrics.centerStartX, this.metrics.centerWidth, this.metrics.centerMaxUnits, this.metrics.centerSpacing, this.team !== 1);
    }
    /**
     * Deploys units in the forward section (e.g., skirmishers).
     * @param forwardUnits - The units to deploy forward.
     */
    deployForward(forwardUnits) {
        const { skirmisherSpawning } = this.gameDataManager.getGameRules();
        if (skirmisherSpawning) {
            const additionalSkirmishers = ArmyDeployer.getSkirmishersAmount(this.gameDataManager, this.units, this.dynamicBattleType);
            for (let i = 0; i < additionalSkirmishers; i++) {
                forwardUnits.push(skirmisherSpawning.unitType);
            }
        }
        this.deployUnitsInLines(forwardUnits, this.metrics.forwardY, this.metrics.centerStartX, this.metrics.centerWidth, this.metrics.centerMaxUnits, this.metrics.centerSpacing, this.team !== 1);
    }
    /**
     * Deploys units in the front section.
     * @param frontUnits - The units to deploy in the front.
     */
    deployFront(frontUnits) {
        const frontWithBuffer = [];
        const frontWithoutBuffer = [];
        frontUnits.forEach((type) => {
            const template = this.gameDataManager
                .getUnitTemplateManager()
                .getTemplate(type);
            if (template.canDeployForward) {
                frontWithBuffer.push(type);
            }
            else {
                frontWithoutBuffer.push(type);
            }
        });
        this.deployUnitsInLines(frontWithBuffer, this.metrics.frontY, this.metrics.centerStartX, this.metrics.centerWidth, this.metrics.centerMaxUnits, this.metrics.centerSpacing, this.team !== 1);
        this.deployUnitsInLines(frontWithoutBuffer, this.metrics.frontY, this.metrics.centerStartX, this.metrics.centerWidth, this.metrics.centerMaxUnits, this.metrics.centerSpacing, this.team !== 1);
    }
    /**
     * Calculates the number of additional skirmishers to spawn based on the battle type and unit composition.
     * @param gameDataManager - The game data manager instance.
     * @param units - A record mapping unit types to their counts.
     * @param dynamicBattleType - The battle type.
     * @returns The number of skirmishers to spawn.
     */
    static getSkirmishersAmount(gameDataManager, units, dynamicBattleType) {
        const skirmishRatio = gameDataManager.getBattleType(dynamicBattleType).skirmisherRatio;
        if (!skirmishRatio) {
            return 0;
        }
        const [skirmisherRatio, coreUnitsRatio] = skirmishRatio;
        let coreUnits = 0;
        let skirmishers = 0;
        for (const type in units) {
            const unitType = Number(type);
            const template = gameDataManager
                .getUnitTemplateManager()
                .getTemplate(unitType);
            if (template.hasSkirmishers) {
                coreUnits += units[unitType];
            }
        }
        // Calculate skirmishers based on the ratio
        skirmishers = Math.floor(coreUnits / coreUnitsRatio) * skirmisherRatio;
        return skirmishers;
    }
    /**
     * Groups units by their category ID.
     * @param gameDataManager - The game data manager instance.
     * @param units - A record mapping unit types to their counts.
     * @returns A record mapping category IDs to arrays of unit types.
     */
    getArmyCompositionByCategory(gameDataManager, units) {
        const unitsByCategory = {};
        for (const _type in units) {
            const type = Number(_type);
            const amount = units[type];
            const template = gameDataManager
                .getUnitTemplateManager()
                .getTemplate(type);
            const unitSet = new Array(amount).fill(type);
            if (unitsByCategory[template.category] !== undefined) {
                unitsByCategory[template.category].push(...unitSet);
            }
            else {
                unitsByCategory[template.category] = [...unitSet];
            }
        }
        return unitsByCategory;
    }
}
exports.ArmyDeployer = ArmyDeployer;
