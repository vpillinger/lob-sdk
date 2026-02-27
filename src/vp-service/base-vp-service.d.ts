import { Player, PlayerSetup } from "@lob-sdk/types";
import { GetVictoryPointsTeam } from "./types";
export declare abstract class BaseVpService {
    cachedAverageVps: number | null;
    cachedVictoryPoints: number[] | null;
    cachedBaseArmyPower: Map<number, number>;
    cachedArmiesPower: Map<number, number>;
    abstract getTeamVictoryPoints(team: number): number;
    abstract getTeamsVictoryStats(): GetVictoryPointsTeam[];
    abstract getVictoryPointDifference(team: number): number;
    abstract getPlayerTicksUnderPressure(playerNumber: number): number;
    abstract getPlayerBaseArmyPower(playerNumber: number): number;
    abstract getTeamArmyPower(team: number): number;
    clearTurnCache(): void;
    /**
     * Gets the average victory points across all teams.
     * Caches the result to avoid recalculating multiple times per turn.
     */
    getAverageVictoryPoints(playerSetups: PlayerSetup[]): number;
    /**
     * Calculates the proportional victory points difference for a team compared to the average of all teams.
     * Returns a positive value if the team has more VPs than average, negative if less.
     * Uses cached average VPs to avoid recalculating multiple times per turn.
     */
    getVictoryPointsRatioFromAverage(playerSetups: PlayerSetup[], team: number): number;
    protected _getTeamVictoryStats(players: Player[], team: number, objectiveVps: number): GetVictoryPointsTeam;
}
