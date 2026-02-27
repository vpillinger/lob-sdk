/**
 * A random() function, must return a number in the interval [0,1), just like Math.random().
 */
export type RandomFn = () => number;
/**
 * Samples the noise field in two dimensions
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction2D = (x: number, y: number) => number;
/**
 * Creates a 2D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction2D}
 */
export declare function createNoise2D(random?: RandomFn): NoiseFunction2D;
/**
 * Builds a random permutation table.
 * @private
 */
export declare function buildPermutationTable(random: RandomFn): Uint8Array;
