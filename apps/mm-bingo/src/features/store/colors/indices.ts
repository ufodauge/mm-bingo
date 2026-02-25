import { atom, useAtomValue } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { markerColorsAtom } from "./colors";
import { CELLS_COUNT } from "../board";

const colorIndicesPrimitiveAtom = atomWithStorage<number[]>(
  "ufodauge/mm-bingo/bingo-color-indices",
  [],
  undefined,
  {
    getOnInit: true,
  },
);

export const colorIndicesAtom = atom(
  (get) => {
    const colorIndices = get(colorIndicesPrimitiveAtom);

    return CELLS_COUNT !== colorIndices.length
      ? Array<number>(CELLS_COUNT).fill(0)
      : colorIndices.map((v) => v + 1);
  },
  (_, set, arr: readonly number[]) => {
    set(colorIndicesPrimitiveAtom, (prev) =>
      CELLS_COUNT !== arr.length ? prev : [...arr.map((v) => v - 1)],
    );
  },
);

type ColorIndicesAction =
  | {
      action: "clear";
    }
  | {
      action: "set-at";
      index: number;
      to: "next" | "prev";
    };

export const useColorIndices = () => useAtomValue(colorIndicesAtom);
export const useSetColorIndices = () =>
  useAtomCallback(
    useCallback((get, set, action: ColorIndicesAction) => {
      switch (action.action) {
        case "clear": {
          // const cellsCount = get(cellsCountAtom);
          set(colorIndicesAtom, Array(CELLS_COUNT).fill(0));
          break;
        }
        case "set-at": {
          const { index, to } = action;
          const colorIndices = get(colorIndicesAtom);
          const colorIndex = colorIndices[index];
          const maxColors = get(markerColorsAtom).length + 1;

          set(
            colorIndicesAtom,
            colorIndices.with(
              index,
              to === "next"
                ? (colorIndex + 1) % maxColors
                : (maxColors + colorIndex - 1) % maxColors,
            ),
          );
          break;
        }
      }
    }, []),
  );
