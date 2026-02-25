import { useAtomValue } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

type MarkerColorsAction =
  | {
      action: "try-add";
      value: string;
    }
  | {
      action: "try-update";
      index: number;
      value: string;
    }
  | {
      action: "try-remove";
      index: number;
    };

const COLORS_MAX = 8;

// const defaultColorAtom = atomWithStorage(
//   "board:default-color",
//   "#422ad5",
//   undefined,
// );
// export const useDefaultMarkerColor = () => useAtomValue(defaultColorAtom);
// export const useSetDefaultMarkerColor = () => useSetAtom(defaultColorAtom);

export const markerColorsAtom = atomWithStorage(
  "ufodauge/mm-bingo/board-marker-colors",
  ["#422ad5", "#f43198", "#00d3bb"],
  undefined,
);

export const useMarkerColorsValue = () => useAtomValue(markerColorsAtom);
export const useSetMarkerColors = () =>
  useAtomCallback(
    useCallback((get, set, action: MarkerColorsAction) => {
      const current = get(markerColorsAtom);

      if (action.action === "try-add") {
        if (current.length < COLORS_MAX) {
          set(markerColorsAtom, [...current, action.value]);
          return true;
        }
        console.error(current.length < COLORS_MAX);
        return false;
      } else if (action.action === "try-remove") {
        if (0 <= action.index && action.index < current.length) {
          set(markerColorsAtom, current.toSpliced(action.index, 1));
          return true;
        }
        return false;
      } else if (action.action === "try-update") {
        if (0 <= action.index && action.index < current.length) {
          set(
            markerColorsAtom,
            current.toSpliced(action.index, 1, action.value),
          );
          return true;
        }
        return false;
      }
    }, []),
  );
