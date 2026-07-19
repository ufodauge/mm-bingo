import type { LineType, Task, TaskSource } from "../../types";
import { emptyTask } from "../emptyTask";
import { SplitMix64 } from "../random";
import { legacyShuffleArray } from "./legacyShuffle";
import { getLineTypesByIndex, RAND_MAX } from "./magicSquare";

// The original task-generation algorithm: exact difficulty match only, and
// the first line-collision failure gives up immediately (falls back to
// emptyTask). Kept byte-for-byte for already-released versions (see
// ALGORITHM_BY_VERSION in ./index.ts) so their seeds keep producing the
// same board — do not change this function's behavior.
export const generateTasksLegacy = (
  seed: number,
  magicSquare: readonly number[],
  taskMap: Map<number, TaskSource[]>,
): Task[] => {
  const rng = new SplitMix64(seed);
  const tagsByLines: Partial<Record<LineType, Set<string>>> = {};

  return magicSquare.map((v, i) => {
    const tasks = taskMap.get(v + 1);
    if (!tasks) {
      return emptyTask;
    }

    const lineTypes = getLineTypesByIndex(i, 5).filter((v) => v !== "card");
    const pickedTask = legacyShuffleArray(tasks, rng.nextInt(0, RAND_MAX)).find(
      (task) => {
        for (const lineType of lineTypes) {
          // 既にその lineType で同じタグを持っているならば無視
          if (
            tagsByLines[lineType] !== undefined &&
            !tagsByLines[lineType].isDisjointFrom(task.tags)
          ) {
            return false;
          }
        }

        return true;
      },
    );

    if (pickedTask === undefined) {
      return emptyTask;
    }

    for (const lineType of lineTypes) {
      tagsByLines[lineType] ??= new Set();
      for (const tag of pickedTask.tags.values()) {
        tagsByLines[lineType].add(tag);
      }
    }

    return {
      difficulty: pickedTask.difficulty,
      lineTypes: lineTypes,
      tags: pickedTask.tags,
      text: pickedTask.text,
      trackers: pickedTask.trackers,
    };
  });
};
