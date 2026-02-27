"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ELO_RANGE = exports.ELO_RANGE_INTERVAL_SECONDS = exports.ELO_RANGE_INCREMENT = exports.BASE_ELO_RANGE = exports.MAX_MATCHMAKING_ELO = exports.MIN_MATCHMAKING_ELO = void 0;
exports.getEloRangeByTime = getEloRangeByTime;
/**
 * Matchmaking ELO constants
 */
exports.MIN_MATCHMAKING_ELO = 1000;
exports.MAX_MATCHMAKING_ELO = 1650;
exports.BASE_ELO_RANGE = 100;
exports.ELO_RANGE_INCREMENT = 40;
exports.ELO_RANGE_INTERVAL_SECONDS = 10;
exports.MAX_ELO_RANGE = 400;
/**
 * Calculates the ELO range based on the time spent in the matchmaking queue.
 * The range starts at BASE_ELO_RANGE and increases by ELO_RANGE_INCREMENT
 * every ELO_RANGE_INTERVAL_SECONDS seconds, up to MAX_ELO_RANGE.
 *
 * @param createdAtTime - The timestamp when the user joined the queue (in milliseconds)
 * @param nowTime - The current timestamp (in milliseconds)
 * @returns The ELO range (half-range, so ±range from the user's ELO)
 */
function getEloRangeByTime(createdAtTime, nowTime) {
    // Calculate time difference in seconds
    const timeDiffSeconds = Math.max(Math.floor((nowTime - createdAtTime) / 1000), 0);
    const increments = Math.floor(timeDiffSeconds / exports.ELO_RANGE_INTERVAL_SECONDS);
    const score = exports.BASE_ELO_RANGE + increments * exports.ELO_RANGE_INCREMENT;
    return Math.min(score, exports.MAX_ELO_RANGE);
}
