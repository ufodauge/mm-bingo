export class SplitMix64 {
  #state: bigint;

  public constructor(seed: number) {
    this.#state = BigInt(Math.trunc(seed));
  }

  public next(): number {
    this.#state += 0x9e3779b97f4a7c15n;
    let z = this.#state;
    z = (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n;
    z = (z ^ (z >> 27n)) * 0x94d049bb133111ebn;
    z = z ^ (z >> 31n);
    return Number(z & 0xffffffffn) / 0xffffffff;
  }

  public nextInt(min: number, max: number) {
    return Math.floor(this.next() * (max - min) + min);
  }
}

// Fisher-Yates. `nextInt(0, i)` is exclusive of `i` (see nextInt above:
// `[min, max)`), but correct Fisher-Yates needs a draw from `[0, i]`
// *inclusive* — i + 1 possibilities, matching the number of positions
// (0..i) still in play at that step. `nextInt(0, i + 1)` is what actually
// covers that whole range; drawing from `nextInt(0, i)` instead meant the
// element at index i could never be the one left in place by this step, a
// real, measurable bias, not a rounding nicety (confirmed empirically: a
// 3-element array only ever produced 2 of its 6 possible orderings).
//
// generateTasksLegacy (and, through generate5x5MagicSquare, the legacy
// magic square layout) depend on the *old*, biased behavior byte-for-byte
// to keep already-shared boards matching their seed — see
// generate/legacyShuffle.ts, a frozen copy of exactly what this function
// used to do, kept for that one purpose only.
export const shuffleArray = <T>(array: readonly T[], seed: number): T[] => {
  const rand = new SplitMix64(seed);

  const result = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand.nextInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export const createRandomizedCopy = <T>(
  array: readonly T[],
  seed: number,
): T[] => {
  const rand = new SplitMix64(seed);
  return array.map(() => array[rand.nextInt(0, array.length)]);
};
