import { atom } from "jotai";
import { seedNumberAtom } from "./seed";
import { colorIndicesAtom } from "./colors/indices";
import type { Rect } from "../../libs/forms";
import { generateTasksAsync } from "../../libs/tasks/v20260208";
import type { LineType } from "../board/lineTypes";
import type { Tracker } from "../../libs/tasks/tracker/tracker";

export const BOARD_SIZE = 5;
export const CELLS_COUNT = BOARD_SIZE ** 2;

export type Cell = {
  text: Partial<Record<string, string>> & { en: string };
  index: number;
  indexColor: number;
  lineTypes: LineType[];
  trackers: Tracker[];
  rect: Rect;
};

type CellsAtomResult = Cell[] | undefined;

let lastCellsAtomResult:
  | {
      seed: number;
      result: CellsAtomResult;
    }
  | undefined = undefined;

// TODO: https://zenn.dev/uhyo/articles/jotai-v2-async-sometimes
export const cellsAtom = atom<CellsAtomResult | Promise<CellsAtomResult>>(
  (get) => {
    const cellsCount = 25;
    const seed = get(seedNumberAtom);
    const colorIndices = get(colorIndicesAtom);

    if (lastCellsAtomResult?.seed === seed) {
      return lastCellsAtomResult.result;
    }

    lastCellsAtomResult = undefined;

    if (cellsCount !== colorIndices.length) {
      console.debug(
        `cellsCount (${cellsCount}) !== colorIndices.length (${colorIndices.length})`,
      );
      return undefined;
    }

    return generateTasksAsync(seed).then((tasksResult) => {
      if (!tasksResult.ok) {
        console.debug(`Failed to generate tasks: ${tasksResult.error.message}`);
        return undefined;
      }

      const tasks = tasksResult.value;
      const result = tasks.slice(0, cellsCount).map((v, i) => ({
        text: {
          en: "???",
          ...v.text,
        },
        index: i,
        indexColor: colorIndices[i],
        lineTypes: v.lineTypes,
        trackers: v.trackers,
        rect: {
          width: 1,
          height: 1,
        },
      }));

      lastCellsAtomResult = { seed, result };
      return result;
    });
  },
);
