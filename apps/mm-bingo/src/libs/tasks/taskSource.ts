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

  // vite.config.ts sets `base` differently per environment (dev: "/", build:
  // "/mm-bingo" — deliberately no trailing slash there, see its own comment)
  // and BASE_URL just reflects that raw value back, trailing slash or not.
  // Stripping any trailing slash before adding exactly one back is what
  // makes this work under both: naively concatenating a literal "/" here
  // produced "//tasks/..." in dev (a leading "//" is a protocol-relative
  // URL, not a path, so fetch tried to hit host "tasks" instead of the dev
  // server), while dropping that "/" entirely to match dev broke the build,
  // where BASE_URL has no trailing slash of its own ("/mm-bingotasks/...").
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const dataUrl = `${base}/tasks/${version}.json`;
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
