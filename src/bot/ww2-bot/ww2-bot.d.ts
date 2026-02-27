import { IServerGame, UnitCategoryId } from "@lob-sdk/types";
import { GameDataManager } from "@lob-sdk/game-data-manager";
import { TurnSubmission } from "@lob-sdk/types";
import { IBot, OnBotPlayScript } from "../types";
/**
 * A string identifier for bot unit categories (e.g., "Infantry", "Cavalry", "Artillery").
 */
export type BotUnitCategory = string;
/**
 * Strategy configuration for a unit category.
 */
export interface UnitStrategy {
    /** The behavior type (e.g., "balanced", "flanking", "support"). */
    behavior: string;
    /** Whether to prefer fire and advance orders. */
    preferFireAndAdvance?: boolean;
    /** Organization threshold for charging. */
    chargeThreshold?: number;
    /** Group cohesion distance multiplier. */
    groupCohesion: number;
    /** Whether to prefer running over walking. */
    preferRun?: boolean;
    /** Whether to avoid artillery units. */
    avoidArtillery?: boolean;
    /** Whether to maintain distance from enemies. */
    maintainDistance?: boolean;
    /** Minimum distance to maintain from enemies (in tiles). */
    minDistanceFromEnemies?: number;
}
/**
 * Configuration for bot behavior, including category groupings, group sizes, and strategies.
 */
export interface BotConfig {
    /** Maps unit category IDs to bot unit categories. */
    categoryGroups: Record<UnitCategoryId, BotUnitCategory>;
    /** Maximum number of units per group for each bot category. */
    maxGroupSize: Record<BotUnitCategory, number>;
    /** Strategy configuration for each bot category. */
    strategies: Record<BotUnitCategory, UnitStrategy>;
    /** Threshold values for bot decision-making. */
    thresholds: {
        /** Organization threshold for charging. */
        orgChargeThreshold: number;
    };
}
/**
 * A bot implementation for WW2 era gameplay.
 * Uses unit grouping and strategic decision-making to control units.
 */
export declare class Ww2Bot implements IBot {
    private _gameDataManager;
    private _game;
    private _playerNumber;
    /** The team number this bot belongs to. */
    private _team;
    private _allyGroups;
    private _enemyGroups;
    private _onBotPlayScript;
    private _scriptName;
    private static _config;
    private get _botConfig();
    private _getBotUnitCategory;
    private _getMaxGroupSize;
    private _getGroupCohesion;
    /**
     * Creates a new BotWW2 instance.
     * @param gameDataManager - The game data manager instance.
     * @param game - The server game instance.
     * @param playerNumber - The player number this bot controls.
     */
    constructor(_gameDataManager: GameDataManager, _game: IServerGame, _playerNumber: number);
    /**
     * Sets a custom bot play script that overrides the default bot behavior.
     * @param onBotPlayScript - The custom script function.
     * @param scriptName - Optional name for the script.
     */
    setOnBotPlayScript(onBotPlayScript: OnBotPlayScript, scriptName?: string): void;
    /**
     * Gets the name of the currently set bot script, if any.
     * @returns The script name, or null if no custom script is set.
     */
    getScriptName(): string | null;
    /**
     * Executes the bot's turn, generating orders for all controlled units.
     * @returns A promise that resolves to the turn submission with orders.
     */
    play(): Promise<TurnSubmission>;
    private _getMyUnits;
    private _getEnemyUnits;
    private _processUnitGroup;
    private _processUnit;
    private _processUnitByStrategy;
    private _getStrategyForType;
    private _formGroups;
    private _getClosestGroup;
    private _getMovementPath;
    private _getTerrainCost;
    /**
     * Gets the player number this bot controls.
     * @returns The player number.
     */
    getPlayerNumber(): number;
    /**
     * Gets the team number this bot belongs to.
     * @returns The team number.
     */
    getTeam(): number;
}
