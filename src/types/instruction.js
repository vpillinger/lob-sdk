"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionType = void 0;
/**
 * Type of procedural generation instruction.
 */
var InstructionType;
(function (InstructionType) {
    /** Instruction to generate terrain using noise. */
    InstructionType["TerrainNoise"] = "TERRAIN_NOISE";
    /** Instruction to generate height using noise. */
    InstructionType["HeightNoise"] = "HEIGHT_NOISE";
    /** Instruction to place a circular terrain area. */
    InstructionType["TerrainCircle"] = "TERRAIN_CIRCLE";
    /** Instruction to place a rectangular terrain area. */
    InstructionType["TerrainRectangle"] = "TERRAIN_RECTANGLE";
    /** Instruction to create a natural path between map edges. */
    InstructionType["NaturalPath"] = "NATURAL_PATH";
    /** Instruction to connect terrain clusters with paths. */
    InstructionType["ConnectClusters"] = "CONNECT_CLUSTERS";
    /** Instruction to place an objective. */
    InstructionType["Objective"] = "OBJECTIVE";
    /** Instruction to generate a lake. */
    InstructionType["Lake"] = "LAKE";
    /** Instruction to place an objective layer. */
    InstructionType["ObjectiveLayer"] = "OBJECTIVE_LAYER";
})(InstructionType || (exports.InstructionType = InstructionType = {}));
