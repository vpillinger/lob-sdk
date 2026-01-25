import {
  AnyOrder,
  Direction,
  IServerGame,
  OrderPathPoint,
  OrderType,
  UnitCategoryId,
  UnitFormationChange,
  TurnSubmission,
} from "@lob-sdk/types";
import { GameDataManager } from "@lob-sdk/game-data-manager";
import { Point2, Vector2 } from "@lob-sdk/vector";
import { UnitGroup } from "./unit-group";
import {
  BotConfig,
  BotStance,
  BotUnitCategory,
  IBot,
  OnBotPlayScript,
} from "./types";
import { AStar } from "@lob-sdk/a-star";
import { getSquaredDistance } from "@lob-sdk/utils";
import { douglasPeucker } from "@lob-sdk/douglas-peucker";
import { BaseUnit } from "@lob-sdk/unit";

/**
 * A bot implementation for Napoleonic era gameplay.
 * Uses unit grouping and strategic decision-making to control units.
 */
export class BotNapoleonic implements IBot {
  /** The team number this bot belongs to. */
  public team: number;
  private allyGroups: UnitGroup[] = [];
  private enemyGroups: UnitGroup[] = [];
  private onBotPlayScript: OnBotPlayScript | null = null;
  private scriptName: string | null = null;

  /** Current strategic stance based on balance of power. */
  private stance: BotStance = BotStance.Positional;
  /** Primary objective or enemy group to focus on. */
  private strategicTarget: Vector2 | null = null;
  /** Offsets for each group to form a frontage. */
  private groupOffsets: Map<UnitGroup, Vector2> = new Map();

  private static _config: BotConfig = {
    categoryGroups: {
      infantry: "Infantry",
      militiaInfantry: "Infantry",
      midCavalry: "Cavalry",
      lightCavalry: "Cavalry",
      scoutCavalry: "Cavalry",
      heavyCavalry: "Cavalry",
      artillery: "Artillery",
      skirmishInfantry: "Skirmishers",
    },
    maxGroupSize: {
      Infantry: 4,
      Cavalry: 4,
      Artillery: 2,
      Skirmishers: 2, // Smaller groups for skirmishers
    },
    strategies: {
      Infantry: {
        behavior: "balanced",
        preferFireAndAdvance: true,
        chargeThreshold: 250,
        groupCohesion: 4,
      },
      Cavalry: {
        behavior: "flanking",
        preferRun: false,
        avoidArtillery: true,
        groupCohesion: 4,
      },
      Artillery: {
        behavior: "support",
        maintainDistance: true,
        minDistanceFromEnemies: 8,
        groupCohesion: 2,
      },
      Skirmishers: {
        behavior: "harass",
        maintainDistance: true,
        minDistanceFromEnemies: 6,
        groupCohesion: 3,
        preferFireAndAdvance: true,
      },
    },
    thresholds: {
      orgChargeThreshold: 250,
    },
  };

  private get _botConfig(): BotConfig {
    return BotNapoleonic._config;
  }

  private getBotUnitCategory(categoryId: UnitCategoryId): BotUnitCategory {
    return this._botConfig.categoryGroups[categoryId];
  }

  private getMaxGroupSize(botCategory: BotUnitCategory): number {
    const baseSize = this._botConfig.maxGroupSize[botCategory];

    // Situational adjustments based on stance
    if (this.stance === BotStance.Aggressive) {
      if (botCategory === "Infantry") return baseSize + 2; // Larger blocks for concentrated attack
      if (botCategory === "Cavalry") return baseSize + 2;
    } else if (this.stance === BotStance.Maneuver) {
      if (botCategory === "Infantry") return Math.max(2, baseSize - 1); // Smaller groups for flexibility
      if (botCategory === "Cavalry") return Math.max(2, baseSize - 1);
    }

    return baseSize;
  }

  private getGroupCohesion(botCategory: BotUnitCategory): number {
    // Get the strategy for this category dynamically
    const strategy = this.getStrategyForType(botCategory);
    return strategy.groupCohesion;
  }

  /**
   * Creates a new BotNapoleonic instance.
   * @param gameDataManager - The game data manager instance.
   * @param game - The server game instance.
   * @param playerNumber - The player number this bot controls.
   */
  constructor(
    private gameDataManager: GameDataManager,
    private game: IServerGame,
    private playerNumber: number
  ) {
    this.team = this.game.getPlayerTeam(this.playerNumber);
  }

  /**
   * Sets a custom bot play script that overrides the default bot behavior.
   * @param onBotPlayScript - The custom script function.
   * @param scriptName - Optional name for the script.
   */
  setOnBotPlayScript(onBotPlayScript: OnBotPlayScript, scriptName?: string) {
    this.onBotPlayScript = onBotPlayScript;
    this.scriptName = scriptName || null;
  }

  /**
   * Gets the name of the currently set bot script, if any.
   * @returns The script name, or null if no custom script is set.
   */
  getScriptName(): string | null {
    return this.scriptName;
  }

  /**
   * Executes the bot's turn, generating orders for all controlled units.
   * @returns A promise that resolves to the turn submission with orders.
   */
  async play(): Promise<TurnSubmission> {
    if (this.onBotPlayScript) {
      try {
        const result = await this.onBotPlayScript(this.game, this.playerNumber);

        if (result) {
          /**
           * If the custom bot script returns a turn submission,
           * use it instead of the default bot behavior.
           */
          return result;
        }
      } catch (error) {
        console.error("Error executing custom bot script:", error);
        // Fall back to default bot behavior on error
      }
    }

    const myUnits = this.getMyUnits();
    const enemies = this.getEnemyUnits();

    const turnSubmission: TurnSubmission = {
      turn: this.game.turnNumber,
      orders: [],
      autofireConfigChanges: [],
      formationChanges: [],
    };

    const orders = turnSubmission.orders;
    const formationChanges = turnSubmission.formationChanges!;

    // Reset groups
    this.allyGroups = this.formGroups(myUnits);
    this.enemyGroups = this.formGroups(enemies);

    // Assess global balance and choose stance
    this.stance = this.assessGlobalBalance(myUnits, enemies);
    this.strategicTarget = this.selectStrategicTarget();

    // Calculate frontage offsets
    this.calculateFrontageOffsets();

    for (const group of this.allyGroups) {
      const groupType = this.getBotUnitCategory(group.category);
      this.processUnitGroup(group, groupType, orders, formationChanges);
    }

    return turnSubmission;
  }

  private calculateFrontageOffsets() {
    this.groupOffsets.clear();
    if (!this.strategicTarget || this.allyGroups.length === 0) return;

    const myCenter = this.getForcesCenter();
    const toTarget = this.strategicTarget.subtract(myCenter);
    if (toTarget.length() === 0) return;

    const direction = toTarget.normalize();
    const right = new Vector2(-direction.y, direction.x);

    // Filter groups that should participate in the main line (non-artillery for now)
    const lineGroups = this.allyGroups.filter(
      (g) => this.getBotUnitCategory(g.category) !== "Artillery"
    );

    if (lineGroups.length <= 1) return;

    // Sort groups by their projection on the 'right' vector (lateral position)
    lineGroups.sort((a, b) => {
      const projA = a.getCenter().subtract(myCenter).dot(right);
      const projB = b.getCenter().subtract(myCenter).dot(right);
      return projA - projB;
    });

    const spacing = this.gameDataManager.getGameConstants().TILE_SIZE * 6;
    const totalLength = (lineGroups.length - 1) * spacing;

    lineGroups.forEach((group, index) => {
      const offsetValue = index * spacing - totalLength / 2;
      this.groupOffsets.set(group, right.scale(offsetValue));
    });
  }

  private assessGlobalBalance(
    myUnits: BaseUnit[],
    enemies: BaseUnit[]
  ): BotStance {
    if (enemies.length === 0) return BotStance.Aggressive;

    const myPower = myUnits.reduce((sum, u) => sum + u.getPower(), 0);
    const enemyPower = enemies.reduce((sum, u) => sum + u.getPower(), 0);

    const myArty = myUnits.filter(
      (u) => this.getBotUnitCategory(u.category) === "Artillery"
    );
    const enemyArty = enemies.filter(
      (u) => this.getBotUnitCategory(u.category) === "Artillery"
    );

    const myCav = myUnits.filter(
      (u) => this.getBotUnitCategory(u.category) === "Cavalry"
    );
    const enemyCav = enemies.filter(
      (u) => this.getBotUnitCategory(u.category) === "Cavalry"
    );

    const artyRatio = (myArty.length + 1) / (enemyArty.length + 1);
    const cavRatio = (myCav.length + 1) / (enemyCav.length + 1);
    const powerRatio = myPower / (enemyPower || 1);

    // Strategic decision making
    if (artyRatio > 1.5 && powerRatio > 0.8) {
      return BotStance.Positional;
    }

    if (cavRatio > 1.5 && powerRatio > 0.9) {
      return BotStance.Maneuver;
    }

    if (powerRatio > 1.2) {
      return BotStance.Aggressive;
    }

    // Default to positional if unsure or balanced
    return BotStance.Positional;
  }

  private selectStrategicTarget(): Vector2 | null {
    const objectives = this.game.getObjectives();
    const enemyObjectives = objectives.filter((o) => o.team !== this.team);

    if (enemyObjectives.length > 0) {
      // For now, pick the closest objective to the center of our forces
      const myCenter = this.getForcesCenter();
      let closestObj = enemyObjectives[0];
      let minDist = Infinity;

      for (const obj of enemyObjectives) {
        const dist = getSquaredDistance(myCenter, obj.position);
        if (dist < minDist) {
          minDist = dist;
          closestObj = obj;
        }
      }
      return closestObj.position;
    }

    // If no objectives, target the strongest enemy group center
    if (this.enemyGroups.length > 0) {
      return this.enemyGroups[0].getCenter();
    }

    return null;
  }

  private getForcesCenter(): Vector2 {
    if (this.allyGroups.length === 0) return new Vector2(0, 0);
    const sum = this.allyGroups.reduce(
      (acc, g) => acc.add(g.getCenter()),
      new Vector2(0, 0)
    );
    return sum.scale(1 / this.allyGroups.length);
  }

  private getMyUnits() {
    return this.game
      .getUnits()
      .filter((unit) => unit.player === this.playerNumber);
  }

  private getEnemyUnits() {
    // Use fog of war filtered method to only see visible enemy units
    return this.game.getVisibleEnemyUnits(this.playerNumber);
  }

  private processUnitGroup(
    group: UnitGroup,
    groupType: BotUnitCategory,
    orders: AnyOrder[],
    formationChanges: UnitFormationChange[]
  ) {
    if (group.size === 0) return;

    const groupCenter = group.getCenter();
    const strategy = this.getStrategyForType(groupType);

    // If we have a strategic target, we might want to prioritize it
    let targetPosition = this.strategicTarget;

    // Apply frontage offset if available
    const offset = this.groupOffsets.get(group);
    if (targetPosition && offset) {
      targetPosition = targetPosition.add(offset);
    }

    // In non-aggressive stances, or if we don't have a strategic target,
    // we default to the closest enemy group or objective (unless we are pursuing a strategic target)
    if (this.stance !== BotStance.Aggressive || !this.strategicTarget) {
      const closestEnemyGroup = this.getClosestGroup(
        groupCenter,
        this.enemyGroups
      );
      const closestEnemyObjective = this.game.getClosestEnemyObjective(
        groupCenter,
        this.team
      );

      const candidates: Vector2[] = [];
      if (closestEnemyGroup) candidates.push(closestEnemyGroup.getCenter());
      if (closestEnemyObjective) candidates.push(closestEnemyObjective.position);

      if (candidates.length > 0) {
        targetPosition = groupCenter.getClosestVector(candidates);
      }
    }

    if (!targetPosition) return;

    group.units.forEach((unit) => {
      this.processUnit(
        unit,
        groupType,
        strategy,
        targetPosition!,
        orders,
        formationChanges
      );
    });
  }

  private processUnit(
    unit: BaseUnit,
    groupType: BotUnitCategory,
    strategy: any,
    targetPosition: Vector2,
    orders: AnyOrder[],
    formationChanges: UnitFormationChange[]
  ) {
    // Use fog of war filtered method to only see visible nearby enemies
    const nearbyEnemies = this.game
      .getVisibleNearbyUnits(
        this.playerNumber,
        unit.position,
        unit.getMaxRange() * 2
      )
      .filter((enemy) => enemy.team !== unit.team && !enemy.isRouting());

    const closestEnemy = this.game.getVisibleClosestUnitOf(
      this.playerNumber,
      unit.position,
      nearbyEnemies
    );

    // Process unit based on strategy properties dynamically
    this.processUnitByStrategy(
      unit,
      closestEnemy,
      strategy,
      targetPosition,
      orders
    );

    // Small detail: Ensure unit has a sensible formation
    this.processUnitFormation(
      unit,
      closestEnemy,
      strategy,
      formationChanges
    );
  }

  private processUnitFormation(
    unit: BaseUnit,
    closestEnemy: BaseUnit | null,
    strategy: any,
    formationChanges: UnitFormationChange[]
  ) {
    if (unit.cannotChangeFormation || unit.pendingFormationId) return;

    const availableFormations = unit.getAvailableFormations();
    if (availableFormations.length <= 1) return;

    let targetFormation = unit.currentFormation;

    // Tactical Square: if threatened from 2 or more sides, form a square
    // A side is threatened if it has enemies but NO solid allies (Infantry/Cavalry)
    const threatenedDirections = this.getThreatenedDirections(unit);
    if (threatenedDirections.size >= 2) {
      const square = availableFormations.find((f) =>
        f.id.toLowerCase().includes("square")
      );
      if (square) {
        targetFormation = square.id;
      }
    }

    // Only proceed with other formation logic if not forcing a square
    if (targetFormation === unit.currentFormation) {
      if (closestEnemy) {
        const dist = unit.position.distanceTo(closestEnemy.position);
        const inRange = dist <= unit.getMaxRange();

        if (inRange) {
          // Formation Safety: Only switch to Line if flanks and rear are safe
          const sideOrRearThreatened =
            threatenedDirections.has(Direction.Right) ||
            threatenedDirections.has(Direction.Left) ||
            threatenedDirections.has(Direction.Back);

          if (!sideOrRearThreatened) {
            // Find formation with best defensive or ranged stats
            // For now, simplicity: prefer "Line" or similar if they have it.
            const line = availableFormations.find((f) =>
              f.id.toLowerCase().includes("line")
            );
            if (line) targetFormation = line.id;
          }
        }
      } else {
        // If moving long distances, Column is often better (if it exists)
        const column = availableFormations.find((f) =>
          f.id.toLowerCase().includes("column")
        );
        if (
          column &&
          unit.position.distanceTo(this.strategicTarget || unit.position) > 500
        ) {
          targetFormation = column.id;
        }
      }
    }

    if (targetFormation !== unit.currentFormation) {
      formationChanges.push({
        unitId: unit.id,
        formationId: targetFormation,
      });
    }
  }

  private findNearbyHighGround(position: Vector2, radius: number): Vector2 | null {
    const { TILE_SIZE } = this.gameDataManager.getGameConstants();
    const startTileX = Math.floor(position.x / TILE_SIZE);
    const startTileY = Math.floor(position.y / TILE_SIZE);
    const tileRadius = Math.floor(radius / TILE_SIZE);

    let bestTile = { x: startTileX, y: startTileY };
    let maxHeight = this.game.map.heightMap[startTileX]?.[startTileY] ?? 0;

    for (let x = startTileX - tileRadius; x <= startTileX + tileRadius; x++) {
      for (let y = startTileY - tileRadius; y <= startTileY + tileRadius; y++) {
        if (x < 0 || x >= this.game.map.width || y < 0 || y >= this.game.map.height) continue;

        const h = this.game.map.heightMap[x][y];
        if (h > maxHeight) {
          maxHeight = h;
          bestTile = { x, y };
        }
      }
    }

    if (maxHeight > (this.game.map.heightMap[startTileX]?.[startTileY] ?? 0)) {
      return new Vector2(
        bestTile.x * TILE_SIZE + TILE_SIZE / 2,
        bestTile.y * TILE_SIZE + TILE_SIZE / 2
      );
    }

    return null;
  }

  private processUnitByStrategy(
    unit: BaseUnit,
    closestEnemy: BaseUnit | null,
    strategy: any,
    targetPosition: Vector2,
    orders: AnyOrder[]
  ) {
    // Stance-based modifications
    if (this.stance === BotStance.Positional) {
      // In positional stance, we are more defensive
      if (closestEnemy) {
        const dist = unit.position.distanceTo(closestEnemy.position);
        const maxRange = unit.getMaxRange();
        // If we are in range and have ammo, stay put
        if (dist <= maxRange && (unit.ammo === null || unit.ammo > 0)) {
          return;
        }
      }
    } else if (this.stance === BotStance.Maneuver && strategy.behavior === "flanking") {
      // Flanking behavior: try to go around the targetPosition
      const myCenter = this.getForcesCenter();
      const toTarget = targetPosition.subtract(myCenter);
      const perp = new Vector2(-toTarget.y, toTarget.x).normalize().scale(500); // Offset by some distance
      targetPosition = targetPosition.add(perp);
    }

    // Handle charging logic if strategy has chargeThreshold
    if (closestEnemy && strategy.chargeThreshold !== undefined) {
      const shouldCharge =
        closestEnemy.org < unit.org &&
        Math.abs(unit.org - closestEnemy.org) >= strategy.chargeThreshold;

      if (shouldCharge) {
        orders.push({
          type: OrderType.Run,
          id: unit.id,
          targetId: closestEnemy.id,
        });
        return;
      }
    }

    // Handle Fire & Advance vs Walk preference
    if (closestEnemy && strategy.preferFireAndAdvance !== undefined) {
      if (strategy.preferFireAndAdvance) {
        const path = this.getMovementPath(unit, closestEnemy.position);
        orders.push({
          type: OrderType.FireAndAdvance,
          id: unit.id,
          path: path,
        });
      } else {
        orders.push({
          type: OrderType.Walk,
          id: unit.id,
          targetId: closestEnemy.id,
        });
      }
      return;
    }

    // Handle artillery avoidance for cavalry
    if (strategy.avoidArtillery && closestEnemy) {
      const enemyGroupType = this.getBotUnitCategory(closestEnemy.category);
      // Find groups that are NOT of the same type as the enemy
      const alternativeGroups = this.enemyGroups.filter(
        (group) => this.getBotUnitCategory(group.category) !== enemyGroupType
      );
      if (alternativeGroups.length > 0) {
        const alternativeTarget = this.getClosestGroup(
          unit.position,
          alternativeGroups
        );
        if (alternativeTarget) {
          targetPosition = alternativeTarget.getCenter();
        }
      }
    }

    // Handle artillery distance maintenance
    if (
      strategy.maintainDistance &&
      strategy.minDistanceFromEnemies !== undefined
    ) {
      // Use fog of war filtered method to only see visible nearby enemies
      const nearbyEnemies = this.game
        .getVisibleNearbyUnits(
          this.playerNumber,
          unit.position,
          strategy.minDistanceFromEnemies *
          this.gameDataManager.getGameConstants().TILE_SIZE
        )
        .filter((enemy) => enemy.team !== unit.team && !enemy.isRouting());

      if (nearbyEnemies.length > 0) {
        const enemyCenter = this.getClosestGroup(
          unit.position,
          this.enemyGroups
        )?.getCenter();
        if (enemyCenter) {
          const direction = unit.position.subtract(enemyCenter).normalize();
          const retreatPosition = unit.position.add(
            direction.scale(
              strategy.minDistanceFromEnemies *
              this.gameDataManager.getGameConstants().TILE_SIZE
            )
          );
          const path = this.getMovementPath(unit, retreatPosition);
          orders.push({
            type: OrderType.Walk,
            id: unit.id,
            path,
          });
        }
        return;
      }
    }

    // Check if unit is already in range (for artillery or positional infantry)
    // Use fog of war filtered method to only see visible nearby enemies
    const nearbyEnemies = this.game
      .getVisibleNearbyUnits(
        this.playerNumber,
        unit.position,
        unit.getMaxRange()
      )
      .filter((enemy) => enemy.team !== unit.team && !enemy.isRouting());

    if (nearbyEnemies.length > 0) {
      // If we are positional, we definitely stay. If we are aggressive, we might stay to fire before charging
      if (this.stance === BotStance.Positional || !strategy.preferRun) {
        return;
      }
    }

    // Special behavior for artillery: seek high ground
    if (this.getBotUnitCategory(unit.category) === "Artillery" && !closestEnemy) {
      const highGround = this.findNearbyHighGround(unit.position, 200);
      if (highGround) {
        targetPosition = highGround;
      }
    }

    // Default movement towards target
    const path = this.getMovementPath(unit, targetPosition);

    if (strategy.preferRun || (this.stance === BotStance.Aggressive && strategy.behavior !== "support")) {
      orders.push({
        type: OrderType.Run,
        id: unit.id,
        path,
      });
    } else {
      orders.push({
        type: OrderType.Walk,
        id: unit.id,
        path,
      });
    }
  }

  private getStrategyForType(groupType: BotUnitCategory) {
    return this._botConfig.strategies[groupType];
  }

  private formGroups(units: BaseUnit[]) {
    const { TILE_SIZE } = this.gameDataManager.getGameConstants();

    const groups: UnitGroup[] = [];

    for (const unit of units) {
      if (unit.isRoutingOrRecovering()) {
        continue;
      }

      let addedToGroup = false;
      const unitGroupType = this.getBotUnitCategory(unit.category);

      for (const group of groups) {
        const groupType = this.getBotUnitCategory(group.category);
        const maxSize = this.getMaxGroupSize(groupType);

        if (
          group.size < maxSize &&
          groupType === unitGroupType &&
          unit.position.distanceTo(group.getCenter()) <=
          TILE_SIZE * this.getGroupCohesion(groupType)
        ) {
          addedToGroup = true;
          group.addUnit(unit);
          break;
        }
      }

      if (!addedToGroup) {
        const newGroup = new UnitGroup([unit], unit.category);
        groups.push(newGroup);
      }
    }

    return groups;
  }

  private getClosestGroup(position: Point2, groups: UnitGroup[]) {
    let closestGroup: UnitGroup | null = null;
    let closestDistance = Infinity;

    for (const group of groups) {
      const squaredDistance = getSquaredDistance(position, group.getCenter());

      if (squaredDistance < closestDistance) {
        closestDistance = squaredDistance;
        closestGroup = group;
      }
    }

    return closestGroup;
  }

  private getMovementPath(
    unit: BaseUnit,
    { x: endX, y: endY }: Point2
  ): OrderPathPoint[] {
    const { TILE_SIZE } = this.gameDataManager.getGameConstants();

    const formationDimensions = this.gameDataManager.getUnitDimensions(
      unit.type,
      unit.currentFormation
    );

    const getStepCost = (from: Point2, to: Point2) => {
      const terrain = this.game.map.terrains[to.x][to.y];

      const modifier = this.gameDataManager.getMovementModifier(
        terrain,
        unit.category
      );

      const terrainCost = this._getTerrainCost(modifier);
      const isPassable = this.gameDataManager.isPassable(terrain);

      if (!isPassable) {
        return Infinity;
      }

      // Check for allied units at the target position
      const positionToCheck = {
        x: to.x * TILE_SIZE + TILE_SIZE / 2,
        y: to.y * TILE_SIZE + TILE_SIZE / 2,
      };

      // Use unit's actual height for nearby units search
      const unitHeight = formationDimensions.height;
      const alliedUnits = this.game
        .getNearbyUnits<BaseUnit>(positionToCheck, unitHeight)
        .filter(
          (u) =>
            u.team === unit.team &&
            u.id !== unit.id && // Don't count the unit itself
            !u.isRoutingOrRecovering()
        );

      // Multiply cost if allied unit is present (e.g., multiply by 5)
      const allyCostMultiplier = alliedUnits.length > 0 ? 5 : 1;

      return terrainCost * allyCostMultiplier;
    };

    const tileWidth = this.game.map.terrains.length;
    const tileHeight = this.game.map.terrains[0]?.length ?? 0;
    const aStar = new AStar(tileWidth, tileHeight, getStepCost);

    const startTile = {
      x: Math.floor(unit.position.x / TILE_SIZE),
      y: Math.floor(unit.position.y / TILE_SIZE),
    };

    const endTile = {
      x: Math.floor(endX / TILE_SIZE),
      y: Math.floor(endY / TILE_SIZE),
    };

    let path = aStar.findPath(startTile, endTile);

    if (path === null) {
      return []; // Don't move if no valid path exists
    }

    path = douglasPeucker(path);

    const halfTileSize = TILE_SIZE / 2;

    return path.reduce((acc: OrderPathPoint[], curr, i) => {
      if (i === 0) {
        return acc;
      }

      acc.push([
        curr.x * TILE_SIZE + halfTileSize,
        curr.y * TILE_SIZE + halfTileSize,
      ]);

      return acc;
    }, []);
  }

  private getThreatenedDirections(unit: BaseUnit): Set<Direction> {
    const checkRadius = unit.getMaxRange() * 1.5;
    const nearbyUnits = this.game.getVisibleNearbyUnits(
      this.playerNumber,
      unit.position,
      checkRadius
    );

    const enemies = nearbyUnits.filter(
      (u) => u.team !== unit.team && !u.isRouting()
    );
    const allies = nearbyUnits.filter(
      (u) => u.team === unit.team && u.id !== unit.id && !u.isRouting()
    );

    const threatened = new Set<Direction>();
    if (enemies.length === 0) return threatened;

    const directions = [
      Direction.Front,
      Direction.Right,
      Direction.Back,
      Direction.Left,
    ];

    for (const side of directions) {
      const enemiesInArc = enemies.filter(
        (e) => unit.getDirectionToPoint(e.position) === side
      );
      if (enemiesInArc.length > 0) {
        // Check if there are "solid" allies in this same arc
        const solidAlliesInArc = allies.filter((a) => {
          const category = this.getBotUnitCategory(a.category);
          const isSolid = category === "Infantry" || category === "Cavalry";
          return isSolid && unit.getDirectionToPoint(a.position) === side;
        });

        // Arc is threatened if enemies exist and NO solid allies protect it
        if (solidAlliesInArc.length === 0) {
          threatened.add(side);
        }
      }
    }

    return threatened;
  }

  private _getTerrainCost(movementModifier: number) {
    // Calculate speed factor: 1 is base speed, +modifier increases it, -modifier decreases it
    const speedFactor = 1 + movementModifier; // e.g., +0.5 -> 1.5, -0.5 -> 0.5

    // Cost is inverse of speed: faster = lower cost, slower = higher cost
    const cost = 1 / speedFactor;

    // Round to nearest integer, but allow fractional costs for positive modifiers
    return cost;
  }

  /**
   * Gets the player number this bot controls.
   * @returns The player number.
   */
  getPlayerNumber(): number {
    return this.playerNumber;
  }

  /**
   * Gets the team number this bot belongs to.
   * @returns The team number.
   */
  getTeam(): number {
    return this.team;
  }
}
