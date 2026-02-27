"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVpService = void 0;
class BaseVpService {
    cachedAverageVps = null;
    cachedVictoryPoints = null;
    cachedBaseArmyPower = new Map();
    cachedArmiesPower = new Map();
    clearTurnCache() {
        this.cachedArmiesPower.clear();
        this.cachedVictoryPoints = null;
        this.cachedBaseArmyPower.clear();
        this.cachedAverageVps = null;
    }
    /**
     * Gets the average victory points across all teams.
     * Caches the result to avoid recalculating multiple times per turn.
     */
    getAverageVictoryPoints(playerSetups) {
        if (this.cachedAverageVps !== null) {
            return this.cachedAverageVps;
        }
        // Get all unique teams from playerSetups
        const allTeams = new Set();
        for (const setup of playerSetups) {
            allTeams.add(setup.team);
        }
        // Calculate average VP of all teams
        let totalVps = 0;
        let teamCount = 0;
        for (const team of allTeams) {
            totalVps += this.getTeamVictoryPoints(team);
            teamCount++;
        }
        this.cachedAverageVps = teamCount > 0 ? totalVps / teamCount : 0;
        return this.cachedAverageVps;
    }
    /**
     * Calculates the proportional victory points difference for a team compared to the average of all teams.
     * Returns a positive value if the team has more VPs than average, negative if less.
     * Uses cached average VPs to avoid recalculating multiple times per turn.
     */
    getVictoryPointsRatioFromAverage(playerSetups, team) {
        const teamVps = this.getTeamVictoryPoints(team);
        const avgVps = this.getAverageVictoryPoints(playerSetups);
        // Proportional difference: (teamVps - avgVps) / avgVps
        // If avgVps is 0, use absolute difference to avoid division by zero
        return avgVps > 0 ? (teamVps - avgVps) / avgVps : teamVps - avgVps;
    }
    _getTeamVictoryStats(players, team, objectiveVps) {
        let ticksUnderPressure = -1;
        let initialArmyPower = 0;
        for (const player of players) {
            if (player.team !== team) {
                continue;
            }
            initialArmyPower += this.getPlayerBaseArmyPower(player.playerNumber);
            // Take the value only from the first player we encounter
            if (ticksUnderPressure === -1) {
                ticksUnderPressure = this.getPlayerTicksUnderPressure(player.playerNumber);
            }
        }
        // This is unlikely to happen, but just in case
        if (ticksUnderPressure === -1) {
            ticksUnderPressure = 0;
        }
        return {
            team,
            initialArmyPower: initialArmyPower,
            currentArmyPower: this.getTeamArmyPower(team),
            ticksUnderPressure: ticksUnderPressure,
            objectiveVps,
        };
    }
}
exports.BaseVpService = BaseVpService;
