"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectionToPoint = exports.checkCollision = exports.nowInSeconds = exports.pack4D = exports.unpack2D = exports.pack2D = exports.setHeightRecursively = exports.clamp = exports.getClosestPointInsideZone = exports.medianPoint = exports.median = void 0;
exports.getSquaredDistance = getSquaredDistance;
exports.divideArrayInHalf = divideArrayInHalf;
exports.radiansToDegreesNormalized = radiansToDegreesNormalized;
exports.degreesToRadians = degreesToRadians;
exports.degreesToRadiansNormalized = degreesToRadiansNormalized;
exports.getRandomInt = getRandomInt;
exports.getRandomFloat = getRandomFloat;
exports.probabilisticRound = probabilisticRound;
exports.getMaxOrgProportionDebuff = getMaxOrgProportionDebuff;
exports.normalizeAngle = normalizeAngle;
const constants_1 = require("@lob-sdk/constants");
const types_1 = require("@lob-sdk/types");
const vector_1 = require("@lob-sdk/vector");
/**
 * Calculates the squared distance between two points.
 * This is faster than calculating the actual distance as it avoids the square root operation.
 * @param point1 - The first point.
 * @param point2 - The second point.
 * @returns The squared distance between the two points.
 */
function getSquaredDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return dx * dx + dy * dy;
}
/**
 * Calculates the median value from an array of numbers.
 * @param values - An array of numbers.
 * @returns The median value, or 0 if the array is empty.
 */
const median = (values) => {
    if (values.length === 0)
        return 0;
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    if (values.length % 2 !== 0) {
        return values[mid];
    }
    return (values[mid - 1] + values[mid]) / 2;
};
exports.median = median;
/**
 * Calculates the median point from an array of points.
 * @param points - An array of points.
 * @returns A point with the median x and y coordinates.
 */
const medianPoint = (points) => {
    const xValues = points.map((point) => point.x);
    const yValues = points.map((point) => point.y);
    return {
        x: (0, exports.median)(xValues),
        y: (0, exports.median)(yValues),
    };
};
exports.medianPoint = medianPoint;
/**
 * Divides an array into two halves.
 * @param array - The array to divide.
 * @returns A tuple containing the first half and second half of the array.
 * @template T - The type of elements in the array.
 */
function divideArrayInHalf(array) {
    const mid = Math.ceil(array.length / 2); // Use Math.ceil to handle odd-length arrays
    const firstHalf = array.slice(0, mid);
    const secondHalf = array.slice(mid);
    return [firstHalf, secondHalf];
}
/**
 * Gets the closest point inside a zone to a given point, clamping the point to the zone boundaries.
 * @param zone - The zone to clamp the point to.
 * @param point - The point to clamp.
 * @param buffer - An optional buffer value to expand the zone boundaries (default: 0).
 * @returns A Vector2 representing the closest point inside the zone.
 */
const getClosestPointInsideZone = (zone, point, buffer = 0) => {
    const clampedX = Math.max(zone.x - buffer, Math.min(point.x, zone.x + zone.width + buffer));
    const clampedY = Math.max(zone.y - buffer, Math.min(point.y, zone.y + zone.height + buffer));
    return new vector_1.Vector2(clampedX, clampedY);
};
exports.getClosestPointInsideZone = getClosestPointInsideZone;
/**
 * Converts radians to degrees and ensures the result is within the range [0, 360).
 */
function radiansToDegreesNormalized(radians) {
    let degrees = radians * (180 / Math.PI);
    degrees = degrees % 360; // Ensure the result is within 0-360
    if (degrees < 0) {
        degrees += 360; // Adjust if the result is negative
    }
    return Math.round(degrees);
}
/**
 * Converts degrees to radians.
 * @param degrees - The angle in degrees.
 * @returns The angle in radians.
 */
function degreesToRadians(degrees) {
    return degrees * constants_1.DEG_TO_RAD;
}
/**
 * Converts degrees to radians with full normalization.
 * Handles values outside [0, 360) range correctly.
 * Use this when the input might be negative or > 360.
 */
function degreesToRadiansNormalized(degrees) {
    let radians = degrees * constants_1.DEG_TO_RAD;
    radians = radians % constants_1.TWO_PI; // Ensure the result is within 0-2PI
    if (radians < 0) {
        radians += constants_1.TWO_PI; // Adjust if the result is negative
    }
    return radians;
}
function getRandomInt(min, max, randomFn = Math.random) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(randomFn() * (max - min + 1)) + min;
}
function getRandomFloat(min, max, randomFn = Math.random) {
    return randomFn() * (max - min) + min;
}
/**
 * Returns a number whose value is limited to the given range.
 *
 * @param {Number} value The initial value
 * @param {Number} min The lower boundary
 * @param {Number} max The upper boundary
 * @returns {Number} A number in the range (min, max)
 */
const clamp = (value, min, max) => {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
};
exports.clamp = clamp;
/**
 * Recursively sets the height of tiles on a grid, ensuring smooth transitions between neighboring tiles.
 * The function propagates heights from a starting tile to its neighbors, adjusting heights to avoid abrupt changes.
 *
 * The propagation is controlled by limiting height differences between neighboring tiles to a maximum of 1.
 * Each tile is processed only once to ensure consistent height adjustments across the grid.
 */
const setHeightRecursively = (x, y, height, heightMap) => {
    const queue = [{ x, y, height }];
    const visited = new Set();
    while (queue.length) {
        const currentTile = queue.shift();
        const { x: cx, y: cy, height: ch } = currentTile;
        // Create a unique identifier for the tile
        const tileId = `${cx},${cy}`;
        if (visited.has(tileId)) {
            continue; // Skip if the tile has already been processed
        }
        visited.add(tileId);
        // Set the height for the current tile
        heightMap[cx][cy] = ch;
        const neighbors = getNeighborHeights(cx, cy, heightMap);
        for (const neighbor of neighbors.values()) {
            const heightDiff = neighbor.height - ch;
            // Determine the correct height for the neighbor
            let newHeight = ch;
            if (heightDiff > 1) {
                newHeight += 1; // Increase by 1 if the neighbor is higher by more than 1
            }
            else if (heightDiff < -1) {
                newHeight -= 1; // Decrease by 1 if the neighbor is lower by more than 1
            }
            else {
                newHeight = neighbor.height; // Keep the neighbor's height if within 1 difference
            }
            // If the height has changed, add the neighbor to the queue
            if (newHeight !== neighbor.height) {
                queue.push({
                    x: neighbor.x,
                    y: neighbor.y,
                    height: newHeight,
                });
            }
        }
    }
};
exports.setHeightRecursively = setHeightRecursively;
const getNeighborHeights = (tileX, tileY, heightMap) => {
    const neighborHeights = [];
    const offsets = [
        [-1, -1], // Top-left
        [0, -1], // Top
        [1, -1], // Top-right
        [-1, 0], // Left
        [1, 0], // Right
        [-1, 1], // Bottom-left
        [0, 1], // Bottom
        [1, 1], // Bottom-right
    ];
    for (const [dx, dy] of offsets) {
        const neighborX = tileX + dx;
        const neighborY = tileY + dy;
        const neighborHeight = heightMap[neighborX]?.[neighborY];
        if (neighborHeight === undefined) {
            continue;
        }
        neighborHeights.push({
            x: neighborX,
            y: neighborY,
            height: neighborHeight,
        });
    }
    return neighborHeights;
};
/**
 * Packs two 8-bit coordinates (x, y) into a single 16-bit number.
 * Useful for indexing maps up to 256x256 tiles.
 */
const pack2D = (x, y) => (x << 8) | (y & 0xff);
exports.pack2D = pack2D;
/**
 * Unpacks a 16-bit key generated by `pack2D` back into its original (x, y) coordinates.
 */
const unpack2D = (key) => ({
    x: (key >> 8) & 0xff,
    y: key & 0xff,
});
exports.unpack2D = unpack2D;
/**
 * Packs four 8-bit coordinates (sourceX, sourceY, targetX, targetY) into a single 32-bit number.
 * Useful for caching line-of-sight or other relationships between two points on a map up to 256x256.
 */
const pack4D = (sx, sy, tx, ty) => ((0, exports.pack2D)(sx, sy) << 16) | (0, exports.pack2D)(tx, ty);
exports.pack4D = pack4D;
const nowInSeconds = () => Math.floor(Date.now() / 1000);
exports.nowInSeconds = nowInSeconds;
/**
 * Rounds a number probabilistically based on its decimal part.
 *
 * If the number is, for example, 1.1, there is a 90% chance of rounding it down to 1
 * and a 10% chance of rounding it up to 2.
 */
function probabilisticRound(number) {
    const lower = Math.floor(number);
    const upper = Math.ceil(number);
    const chance = number - lower;
    const random = Math.random();
    return random < chance ? upper : lower;
}
/**
 * Checks if a collision occurs between two collision levels.
 * Returns true if both collisionLevel1 and collisionLevel2 are non-zero
 * and collisionLevel1 is greater than or equal to collisionLevel2.
 */
const checkCollision = (collisionLevel1, collisionLevel2) => {
    return (collisionLevel1 !== constants_1.NO_COLLISION_LEVEL &&
        collisionLevel2 !== constants_1.NO_COLLISION_LEVEL &&
        collisionLevel1 >= collisionLevel2);
};
exports.checkCollision = checkCollision;
/**
 * Determines the relative direction from a unit's position to a target point,
 * taking into account the unit's rotation and front/back arc configuration.
 *
 * @param from - The unit's current position (Point2 with x, y coordinates).
 * @param to - The target point to determine direction to (Point2 with x, y coordinates).
 * @param rotation - The unit's current rotation angle in radians (0 = facing right/east, π/2 = facing up/north).
 * @param frontBackArc - The angular width in radians for both the front and back arcs.
 *                       The remaining space is divided between left and right sides.
 * @returns The direction enum value: `Direction.Front`, `Direction.Back`, `Direction.Left`, or `Direction.Right`.
 */
const getDirectionToPoint = (from, to, rotation, frontBackArc) => {
    const translatedPoint = {
        x: to.x - from.x,
        y: to.y - from.y,
    };
    const angle = normalizeAngle(Math.atan2(translatedPoint.y, translatedPoint.x) - rotation);
    // Calculate arc boundaries
    const frontStart = (constants_1.TWO_PI - frontBackArc / 2) % constants_1.TWO_PI;
    const frontEnd = (frontBackArc / 2) % constants_1.TWO_PI;
    const backStart = (Math.PI - frontBackArc / 2 + constants_1.TWO_PI) % constants_1.TWO_PI;
    const backEnd = (Math.PI + frontBackArc / 2) % constants_1.TWO_PI;
    // Helper to check if angle is within an arc
    function inArc(a, start, end) {
        if (start < end)
            return a >= start && a <= end;
        return a >= start || a <= end;
    }
    if (inArc(angle, frontStart, frontEnd)) {
        return types_1.Direction.Front;
    }
    else if (inArc(angle, backStart, backEnd)) {
        return types_1.Direction.Back;
    }
    else if (angle > frontEnd && angle < backStart) {
        return types_1.Direction.Right;
    }
    else {
        return types_1.Direction.Left;
    }
};
exports.getDirectionToPoint = getDirectionToPoint;
function getMaxOrgProportionDebuff(gameDataManager, hpProportion, staminaProportion) {
    const { organization } = gameDataManager.getGameRules();
    if (!organization) {
        throw new Error(`organization rule is required in game rules for era ${gameDataManager.era}`);
    }
    const MAX_ORG_DEBUFF_MIN_HP_PROPORTION = organization.maxOrgDebuffMinHpProportion;
    const MAX_ORG_DEBUFF_HP = organization.maxOrgDebuffHp;
    const MAX_ORG_DEBUFF_STAMINA_HIGH_PROPORTION = organization.maxOrgDebuffStaminaHighProportion;
    const MAX_ORG_DEBUFF_STAMINA_LOW_PROPORTION = organization.maxOrgDebuffStaminaLowProportion;
    const MAX_ORG_DEBUFF_STAMINA = organization.maxOrgDebuffStamina;
    // Calculate HP debuff
    let hpDebuff = 0;
    if (hpProportion > MAX_ORG_DEBUFF_MIN_HP_PROPORTION) {
        // Scale linearly from 0 to MAX_ORG_DEBUFF_HP
        hpDebuff =
            ((1 - hpProportion) * MAX_ORG_DEBUFF_HP) /
                (1 - MAX_ORG_DEBUFF_MIN_HP_PROPORTION);
    }
    else {
        // Clamp to MAX_ORG_DEBUFF_HP for hpProportion <= MIN_HP
        hpDebuff = MAX_ORG_DEBUFF_HP;
    }
    // Calculate stamina debuff
    let staminaDebuff = 0;
    if (staminaProportion < MAX_ORG_DEBUFF_STAMINA_HIGH_PROPORTION) {
        // Linearly scale stamina debuff from 0 at high stamina to MAX_ORG_DEBUFF_STAMINA at low stamina
        const clampedStamina = Math.max(staminaProportion, MAX_ORG_DEBUFF_STAMINA_LOW_PROPORTION);
        staminaDebuff =
            ((MAX_ORG_DEBUFF_STAMINA_HIGH_PROPORTION - clampedStamina) /
                (MAX_ORG_DEBUFF_STAMINA_HIGH_PROPORTION -
                    MAX_ORG_DEBUFF_STAMINA_LOW_PROPORTION)) *
                MAX_ORG_DEBUFF_STAMINA;
    }
    // Combine debuffs
    return hpDebuff + staminaDebuff;
}
/**
 * Helper function to normalize an angle to be between 0 and 2π
 */
function normalizeAngle(angle) {
    return ((angle % constants_1.TWO_PI) + constants_1.TWO_PI) % constants_1.TWO_PI;
}
