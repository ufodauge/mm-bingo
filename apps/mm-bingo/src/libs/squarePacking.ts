import type { Rect } from './forms';

export function generateRandomRects(
  n: number,
  maxSize: number,
  rng: () => number,
  options?: Partial<{
    generateRect: boolean;
  }>
): Rect[] {
  if (!Number.isInteger(n) || !Number.isInteger(maxSize)) {
    throw new Error('Inputs must be integers.');
  }

  const results: Rect[] = [];

  const MIN_SIZE = 1;
  if (maxSize < MIN_SIZE) {
    throw new Error(`maxSize (${maxSize}) should be upper than or equal to 1.`);
  }

  const generateSize = (baseIndex: number, map: readonly boolean[]) => {
    let capableSize = 0;
    const max = Math.min(
      maxSize,
      n - (baseIndex % n),
      n - Math.floor(baseIndex / n)
    );

    for (let i = 0; i < max; i++) {
      if (map[baseIndex + i] === false) {
        capableSize += 1;
      } else {
        break;
      }
    }

    return Math.floor(rng() * capableSize + 1);
  };

  const generateWidth = (baseIndex: number, map: readonly boolean[]) => {
    let capableWidth = 0;
    const maxWidth = Math.min(maxSize, n - (baseIndex % n));

    for (let x = 0; x < maxWidth; x++) {
      if (map[baseIndex + x] === false) {
        capableWidth += 1;
      } else {
        break;
      }
    }

    return Math.floor(rng() * capableWidth + 1);
  };

  const generateHeight = (baseIndex: number, map: readonly boolean[]) => {
    let capableHeight = 0;
    const maxHeight = Math.min(maxSize, n - Math.floor(baseIndex / n));

    for (let y = 0; y < maxHeight; y++) {
      if (map[baseIndex + y * n] === false) {
        capableHeight += 1;
      } else {
        break;
      }
    }

    return Math.floor(rng() * capableHeight + 1);
  };

  const state: boolean[] = Array(n * n).fill(false);

  for (let i = 0; i < state.length; i++) {
    const nextIndex = state.findIndex((v) => v === false);
    if (nextIndex === -1) {
      break;
    }

    const newRectSize: Rect = options?.generateRect
      ? {
          width: generateWidth(nextIndex, state),
          height: generateHeight(nextIndex, state),
        }
      : (() => {
          const size = generateSize(nextIndex, state);
          return {
            width: size,
            height: size,
          };
        })();

    results.push(structuredClone(newRectSize));

    for (let y = 0; y < newRectSize.height; y++) {
      for (let x = 0; x < newRectSize.width; x++) {
        state[nextIndex + x + y * n] = true;
      }
    }

    // #region debug
    if (import.meta.env.DEV) {
      console.log(
        `i: ${nextIndex}, w: ${newRectSize.width}, h: ${newRectSize.height}`
      );
      let str = '';
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          str += state[x + y * n] ? '[]' : '__';
        }
        str += '\n';
      }
      console.log(str);
    }
    // #endregion
  }

  return results;
}
