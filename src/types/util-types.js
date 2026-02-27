"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamSize = exports.GameTimePreset = exports.GAME_TIME_PRESET_IDS = exports.Size = void 0;
var Size;
(function (Size) {
    Size["XSmall"] = "xs";
    Size["Small"] = "s";
    Size["Medium"] = "m";
    Size["Large"] = "l";
    Size["ExtraLarge"] = "xl";
})(Size || (exports.Size = Size = {}));
exports.GAME_TIME_PRESET_IDS = [
    "blitz",
    "rapid",
    "strategic",
    "active",
    "standard",
    "epic",
];
/** Convenience constants for game time preset IDs (avoids enum) */
exports.GameTimePreset = {
    Blitz: "blitz",
    Rapid: "rapid",
    Strategic: "strategic",
    Active: "active",
    Standard: "standard",
    Epic: "epic",
};
var TeamSize;
(function (TeamSize) {
    TeamSize["OneVsOne"] = "1v1";
    TeamSize["TwoVsTwo"] = "2v2";
})(TeamSize || (exports.TeamSize = TeamSize = {}));
