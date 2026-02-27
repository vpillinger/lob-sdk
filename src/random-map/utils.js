"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosition = void 0;
exports.convertTo01Range = convertTo01Range;
exports.getRandomEdgePoints = getRandomEdgePoints;
const utils_1 = require("@lob-sdk/utils");
const getPosition = (position, width, height, randomFn) => {
    switch (position.type) {
        case "exact": {
            const [percentageX, percentageY] = position.coords;
            const positionX = Math.floor(width * (percentageX / 100));
            const positionY = Math.floor(height * (percentageY / 100));
            return [positionX, positionY];
        }
        case "range": {
            const [minX, minY] = position.min;
            const [maxX, maxY] = position.max;
            const percentageX = (0, utils_1.getRandomInt)(minX, maxX, randomFn);
            const percentageY = (0, utils_1.getRandomInt)(minY, maxY, randomFn);
            const positionX = Math.floor(width * (percentageX / 100));
            const positionY = Math.floor(height * (percentageY / 100));
            return [positionX, positionY];
        }
    }
};
exports.getPosition = getPosition;
function convertTo01Range(value) {
    return (0, utils_1.clamp)((value + 1) / 2, 0, 1);
}
function getRandomEdgePoints(tilesX, tilesY, randomFn) {
    // Helper function to get a random integer
    const randomInt = (min, max) => (0, utils_1.getRandomInt)(min, max, randomFn);
    // Helper function to get a random edge point with specified edge
    const getEdgePoint = (edge) => {
        switch (edge) {
            case 0: // top edge
                return { x: randomInt(0, tilesX - 1), y: 0 };
            case 1: // right edge
                return { x: tilesX - 1, y: randomInt(0, tilesY - 1) };
            case 2: // bottom edge
                return { x: randomInt(0, tilesX - 1), y: tilesY - 1 };
            default: // left edge (3)
                return { x: 0, y: randomInt(0, tilesY - 1) };
        }
    };
    // Get first random edge
    const startEdge = randomInt(0, 3);
    // Get second edge (ensuring it's different from the first)
    let endEdge = randomInt(0, 2);
    if (endEdge >= startEdge)
        endEdge++;
    const start = getEdgePoint(startEdge);
    const end = getEdgePoint(endEdge);
    return { start, end };
}
