"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameScenarioType = void 0;
/**
 * Type of game scenario.
 */
var GameScenarioType;
(function (GameScenarioType) {
    /** Preset scenario with a fixed map and unit placement. */
    GameScenarioType["Preset"] = "preset";
    /** Randomly generated scenario. */
    GameScenarioType["Random"] = "random";
    /** Hybrid scenario combining preset and random elements. */
    GameScenarioType["Hybrid"] = "hybrid";
})(GameScenarioType || (exports.GameScenarioType = GameScenarioType = {}));
