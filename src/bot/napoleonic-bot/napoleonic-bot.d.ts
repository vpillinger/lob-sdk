import { OnBotPlayScript } from "../types";
import { Vector2 } from "@lob-sdk/vector";
import { TurnSubmission, IServerGame } from "@lob-sdk/types";
import { GameDataManager } from "@lob-sdk/game-data-manager";
import { INapoleonicBot } from "./types";
/**
 * A bot implementation for Napoleonic era gameplay.
 * Uses unit grouping and strategic decision-making to control units.
 */
export declare class NapoleonicBot implements INapoleonicBot {
    private _gameDataManager;
    private _game;
    private _playerNumber;
    private _onBotPlayScript;
    private _scriptName;
    private _team;
    private readonly _strategies;
    /**
     * Static mapping of unit categories to bot formation groups.
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
    private _groupUnits;
    private _getMyUnits;
    private _getEnemyUnits;
    private _getTerrainCost;
    /**
     * Gets the high-level group name for a given unit category.
     * @param categoryId - The unit category ID.
     * @returns The group name (e.g., "infantry", "cavalry").
     */
    getGroup(categoryId: string): string;
    /**
     * Gets the player number this bot controls.
     * @returns The player number.
     */
    getPlayerNumber(): number;
    /**
     * Gets the game data manager instance.
     */
    getGameDataManager(): GameDataManager;
    /**
     * Gets the team number this bot belongs to.
     * @returns The team number.
     */
    getTeam(): number;
    getClosestAllyBigObjective(position: Vector2): import("../../objective").BaseObjective | null;
    getClosestEnemyBigObjective(position: Vector2): import("../../objective").BaseObjective | null;
    private static readonly _CATEGORY_TO_GROUP;
}
