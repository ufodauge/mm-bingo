import { SplitMix64 } from "../random";

// A frozen, byte-for-byte copy of shuffleArray as it existed before the
// off-by-one fix in random.ts. Its Fisher-Yates draw excluded the current
// index itself (`rand.nextInt(0, i)`, which is half-open and so never
// returns `i`) instead of the correct `rand.nextInt(0, i + 1)` — meaning
// the element at index `i` could never be left in place by that step, a
// real, measurable bias (see random.ts).
//
// generateTasksLegacy — and, via generate5x5MagicSquare, the legacy magic
// square layout — both still need EXACTLY this behavior: legacy is kept
// byte-for-byte forever so an already-shared board keeps matching its
// seed (see ALGORITHM_BY_VERSION in ../index.ts). Do not "fix" this copy;
// that would defeat the entire point of it existing.
export const legacyShuffleArray = <T>(
  array: readonly T[],
  seed: number,
): T[] => {
  const rand = new SplitMix64(seed);

  const result = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};
