import { atom } from "jotai";

import type { Rect } from "../../libs/forms";
import {
  generateTasksAsync,
  isEmptyTask,
  isFallbackTask,
} from "../../libs/tasks/index";
import type { Tracker } from "../../libs/tracker/tracker";
import type { LineType } from "../board/lineTypes";
import { colorIndicesAtom } from "./colors/indices";
import { seedNumberAtom } from "./seed";
import { taskVersionAtom } from "./taskVersion";
import { isTaskVersion, latestTaskVersion } from "./versions/taskVersion";

export const BOARD_SIZE = 5;
export const CELLS_COUNT = BOARD_SIZE ** 2;

export type Cell = {
  text: Partial<Record<string, string>> & { en: string };
  index: number;
  indexColor: number;
  lineTypes: LineType[];
  trackers: Tracker[];
  rect: Rect;
  isEmpty: boolean;
  isFallback: boolean;
};

type CellsAtomResult = Cell[] | undefined;

let lastCellsAtomResult:
  | {
      seed: number;
      // The generated tasks depend on (seed, version) together — a version
      // change with the same seed (e.g. switching task versions in
      // Settings, or rejoining a room whose seed happens to match what was
      // last cached locally) must still invalidate this cache. Keying it on
      // seed alone previously let a stale, wrong-version board survive.
      version: string;
      result: CellsAtomResult;
    }
  | undefined = undefined;

// TODO: https://zenn.dev/uhyo/articles/jotai-v2-async-sometimes
export const cellsAtom = atom<CellsAtomResult | Promise<CellsAtomResult>>(
  (get) => {
    const cellsCount = 25;
    const seed = get(seedNumberAtom);
    const colorIndices = get(colorIndicesAtom);
    const versionRaw = get(taskVersionAtom).toString();
    const version = isTaskVersion(versionRaw) ? versionRaw : latestTaskVersion;

    if (
      lastCellsAtomResult?.seed === seed &&
      lastCellsAtomResult?.version === version
    ) {
      return lastCellsAtomResult.result;
    }

    lastCellsAtomResult = undefined;

    if (cellsCount !== colorIndices.length) {
      console.debug(
        `cellsCount (${cellsCount}) !== colorIndices.length (${colorIndices.length})`,
      );
      return undefined;
    }

    return generateTasksAsync(seed, version).then((tasksResult) => {
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
        isEmpty: isEmptyTask(v),
        isFallback: isFallbackTask(v),
      }));

      lastCellsAtomResult = { seed, version, result };
      return result;
    });
  },
);
