declare module "pcg-random" {
  export default class PcgRandom {
    /**
     * Construct a random number generator that uses the PCG32 algorithm.
     * Produce a PcgRandom with a random seed, and the default increment value.
     */
    constructor();

    /**
     * Construct a random number generator that uses the PCG32 algorithm.
     * Produce a PcgRandom that uses seedHi32 and seedLo32 as the 2 parts of the 64 bit seed, and uses the default increment value.
     * @param seedLo32
     * @param seedHi32
     */
    constructor(seedLo32: number, seedHi32: number = 0);
    /**
     * Construct a random number generator that uses the PCG32 algorithm.
     * Produce a PcgRandom that uses seedHi32 and seedLo32 as the 2 parts of the 64 bit seed, and uses the default increment value.
     * @param seedLo32
     * @param seedHi32
     * @param incLo32
     * @param incHi32
     */
    constructor(
      seedLo32: number,
      seedHi32: number,
      incLo32: number,
      incHi32: number
    );
    /**
     * Construct a random number generator that uses the PCG32 algorithm.
     * If bigints are supported, you can provide the seed and increment value as bigints. (Note that bigint support is not at all required to use this library).
     * @param seed
     * @param inc
     */
    constructor(seed: bigint, inc?: bigint);
    /**
     * Construct a random number generator that uses the PCG32 algorithm.
     * Construct a PcgRandom using a state array (which should have been returned by getState).
     * @param stateArray
     */
    constructor(stateArray: [number, number, number, number]);

    /**
     * Set the seed and optionally the increment value (this value controls how the RNG evolves, but the default is good enough for essentially all cases).
     * The arguments to this method are the same as for the constructor, with the only difference that if no value is provided for the incrementer, it remains the same as it did prior to calling
     *
     * Randomize the seed.
     */
    public setSeed();
    /**
     * Set the seed and optionally the increment value (this value controls how the RNG evolves, but the default is good enough for essentially all cases).
     * The arguments to this method are the same as for the constructor, with the only difference that if no value is provided for the incrementer, it remains the same as it did prior to calling
     *
     * Set 64 bit seed to each pair of 32 bit values (in parts). Leaves the increment value in place.
     */
    public setSeed(seedLo32: number, seedHi32: number = 0);
    /**
     * Set the seed and optionally the increment value (this value controls how the RNG evolves, but the default is good enough for essentially all cases).
     * The arguments to this method are the same as for the constructor, with the only difference that if no value is provided for the incrementer, it remains the same as it did prior to calling
     *
     * Set 64 bit seed and increment value to each pair of 32 bit values (in parts).
     */
    public setSeed(
      seedLo32: number,
      seedHi32: number,
      incLo32: number,
      incHi32: number
    );
    /**
     * Set the seed and optionally the increment value (this value controls how the RNG evolves, but the default is good enough for essentially all cases).
     * The arguments to this method are the same as for the constructor, with the only difference that if no value is provided for the incrementer, it remains the same as it did prior to calling
     *
     * If bigints are supported, you can provide the seed and (optionally) increment value as bigints. If inc is not provided, the RNG's increment value will be unchanged.
     */
    public setSeed(seed: bigint, inc?: bigint);
    /**
     * Set the seed and optionally the increment value (this value controls how the RNG evolves, but the default is good enough for essentially all cases).
     * The arguments to this method are the same as for the constructor, with the only difference that if no value is provided for the incrementer, it remains the same as it did prior to calling
     *
     * Initialize with a state array, equivalent to setState. This exists mostly so that the constructor can use setSeed for everything.
     */
    public setSeed(stateArray: [number, number, number, number]);

    /**
     * takes no arguments, and returns a copy of the internal state of this random number generator as an Array.
     */
    public getState(): [number, number, number, number];

    /**
     * takes a single argument, which is an array that should be returned by getState.
     * @param stateArray
     */
    public setState(stateArray: [number, number, number, number]);

    /**
     * Get a uniformly distributed 32 bit integer between 0 (inclusive) and a specified value (exclusive).
     * If the maximum value isn't specified, the function will return a uniformly distributed 32 bit integer (equivalent to PcgRandom.prototype.next32()).
     * @param max
     */
    public integer(max?: number): number;

    /**
     * Get a uniformly distributed IEEE-754 binary64 between 0.0 and 1.0. This is essentially equivalent to Math.random().
     */
    public number(): number;

    /**
     * Generate a random 32 bit integer between [0, 0xffff_ffff], inclusive. Generally, PcgRandom.prototype.integer should be preferred.
     *
     * ### Caveats
     * You should not use this with the % operator, as it will introduce bias, instead, use the integer method. That is:
     * ```js
     * var rng = new PcgRandom();
     * // BAD (biased towards low numbers):
     * var zeroToNBad = rng.next32() % n;
     * // GOOD (unbiased):
     * var zeroToNGood = rng.integer(n);
     * ```
     */
    public next32(): number;
  }
}
