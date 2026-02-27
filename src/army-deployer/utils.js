"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDefaultArmy = void 0;
const generateDefaultArmy = (gameDataManager, dynamicBattleType) => {
    const battleType = gameDataManager.getBattleType(dynamicBattleType);
    return {
        dynamicBattleType,
        units: battleType.defaultArmy,
    };
};
exports.generateDefaultArmy = generateDefaultArmy;
