import type { LineType } from "../../types";
import { shuffleArray, SplitMix64 } from "../random";

export type ShuffleFn = <T>(array: readonly T[], seed: number) => T[];

// Shared "how big a range to draw a shuffle seed from" for every
// SplitMix64.nextInt() call in this module and the two generators built on
// top of it — not itself meaningful beyond being "large enough".
export const RAND_MAX = 1000000;

export const getLineTypesByIndex = (
  i: number,
  cellCount: number,
): LineType[] => {
  const result: LineType[] = ["card"];

  // cols
  const colIndex = (i % cellCount) + 1;
  result.push(`col${colIndex}`);

  // rows
  const rowIndex = Math.floor(i / cellCount) + 1;
  result.push(`row${rowIndex}`);

  // tlbr
  if (i % (cellCount + 1) === 0) {
    result.push("tlbr");
  }

  // bltr
  const BLTR = [...Array(cellCount)].map((_, j) => (j + 1) * (cellCount - 1));
  if (BLTR.includes(i)) {
    result.push("bltr");
  }

  return result;
};

// `shuffle` defaults to the current, correct shuffleArray — pass
// generate/legacyShuffle.ts's legacyShuffleArray explicitly for a legacy
// version, so its magic square layout keeps matching its seed
// byte-for-byte (see that file and shuffleArray in ../random for why).
// https://ja.wikipedia.org/wiki/%E9%AD%94%E6%96%B9%E9%99%A3#5%C3%975%E3%81%AE%E9%AD%94%E6%96%B9%E9%99%A3%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9
export const generate5x5MagicSquare = (
  { seed }: { seed: number },
  shuffle: ShuffleFn = shuffleArray,
) => {
  const size = 5;
  const rng = new SplitMix64(seed);

  const numerators = shuffle(
    Array.from({ length: size }, (_, i) => size * i),
    rng.nextInt(0, RAND_MAX),
  );
  const denominators = shuffle(
    Array.from({ length: size }, (_, i) => i),
    rng.nextInt(0, RAND_MAX),
  );

  const result = Array.from({ length: size ** 2 }, (_, i) => {
    const x = Math.floor(i / size);
    const y = i % size;

    return numerators[(x * 3 + y) % size] + denominators[(y * 3 + x) % size];
  });

  return result;
};
