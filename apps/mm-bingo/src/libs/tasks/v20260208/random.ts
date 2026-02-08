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

export const shuffleArray = <T>(array: readonly T[], seed: number) => {
  const rand = new SplitMix64(seed);

  const result = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export const createRandomizedCopy = <T>(array: readonly T[], seed: number) => {
  const rand = new SplitMix64(seed);
  return array.map(() => array[rand.nextInt(0, array.length - 1)]);
};
