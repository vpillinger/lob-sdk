"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectiveExecutor = void 0;
const utils_1 = require("../utils");
const seed_1 = require("@lob-sdk/seed");
class ObjectiveExecutor {
    instruction;
    scenario;
    seed;
    index;
    widthPx;
    heightPx;
    objectives;
    random;
    constructor(instruction, scenario, seed, index, widthPx, heightPx, objectives) {
        this.instruction = instruction;
        this.scenario = scenario;
        this.seed = seed;
        this.index = index;
        this.widthPx = widthPx;
        this.heightPx = heightPx;
        this.objectives = objectives;
        this.random = (0, seed_1.randomSeeded)((0, seed_1.deriveSeed)(seed, index + 1));
    }
    execute() {
        const { widthPx, heightPx, objectives, random } = this;
        const { position, player } = this.instruction;
        const [positionX, positionY] = (0, utils_1.getPosition)(position, widthPx, heightPx, random);
        objectives.push({
            pos: { x: positionX, y: positionY },
            player: player,
        });
    }
}
exports.ObjectiveExecutor = ObjectiveExecutor;
