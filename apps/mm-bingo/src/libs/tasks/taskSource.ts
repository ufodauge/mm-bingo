import * as vb from "valibot";

import type { TaskVersion } from "../../features/store/versions/taskVersion";
import { err, ok, type Result } from "../result";
import type { TaskSource } from "../types";
import { taskSourceListSchema } from "./schema";

// Fetches and parses a version's task pool exactly once, no matter how many
// boards get generated from it — every generateTasksAsync() call for the
// same version reuses this same in-flight/settled promise instead of
// re-fetching.
const taskSourceMap: Map<
  TaskVersion,
  Promise<Result<Map<number, TaskSource[]>, Error>>
> = new Map();

export const getTaskSourcePromise = (
  version: TaskVersion,
): Promise<Result<Map<number, TaskSource[]>, Error>> => {
  const taskSource = taskSourceMap.get(version);
  if (taskSource) {
    return taskSource;
  }

  const dataUrl = `${import.meta.env.BASE_URL}/tasks/${version}.json`;
  const result = fetch(dataUrl).then(
    async (v) => {
      if (!v.ok) {
        return err(Error(`${dataUrl} is invalid.`));
      }

      const parsed = await v.json();
      const result = await vb.safeParseAsync(taskSourceListSchema, parsed);

      if (!result.success) {
        return err(Error("Error while parsing JSON."));
      }

      const grouped = Map.groupBy(
        result.output.map(
          (v): TaskSource => ({
            difficulty:
              typeof v.difficulty === "number"
                ? v.difficulty
                : Number.parseInt(v.difficulty),
            tags: new Set(v.tag),
            text: v.contents,
            trackers: v.trackers,
            weight: v.weight,
          }),
        ),
        (v) => v.difficulty,
      );

      return ok(grouped);
    },
    (v) => err(v instanceof Error ? v : Error(v)),
  );

  taskSourceMap.set(version, result);
  return result;
};
