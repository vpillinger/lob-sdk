import { Circle } from "./circle";
import { CircleGroupCollision } from "./types";
/**
 * Checks for collisions between two groups of circles and returns pairs of colliding circles with their distances
 * @param groupA First array of circles
 * @param groupB Second array of circles
 * @returns Array of objects containing colliding circle pairs and the distance between their centers
 */
export declare function checkCircleGroupCollisions(groupA: Circle[], groupB: Circle[]): CircleGroupCollision[];
