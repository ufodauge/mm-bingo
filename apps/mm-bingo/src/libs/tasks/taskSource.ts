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

// Where the per-version task pools (tasks/<version>.json) are served from.
//
// The default resolves against this module's own URL. That is what lets the
// published library entry work with no configuration at all: dist/task.js
// sits right next to dist/tasks/, so an outside consumer importing
// https://<host>/mm-bingo/task.js from any origin still has its fetches land
// on https://<host>/mm-bingo/tasks/<version>.json.
//
// That default is wrong for this app's own bundle, though — the app build
// emits its chunks into assets/, so import.meta.url would resolve to
// assets/tasks/. The app overrides this at startup instead; see
// routes/router.ts.
//
// Swapping this module's own file name for "tasks/" is what `new URL("./
// tasks/", import.meta.url)` would do, minus two problems: Vite rewrites
// `new URL("<literal>", import.meta.url)` into a build-time asset reference,
// and this module is also typechecked under tsconfig.scripts.json, which has
// no DOM lib and so no URL global to lean on.
let tasksBaseUrl = import.meta.url.replace(/[^/]*$/, "tasks/");

/**
 * Point the task loader at a different `tasks/` directory.
 *
 * Absolute URLs and document-relative paths both work — the value is only
 * ever concatenated with `<version>.json` and handed to `fetch`, which
 * resolves anything relative against the document. A missing trailing slash
 * is added for you.
 *
 * Call this before the first `generateTasksAsync()` for a given version:
 * pools are cached per version, so a later change will not dislodge one that
 * has already been fetched.
 */
export const setTasksBaseUrl = (base: string): void => {
  tasksBaseUrl = base.endsWith("/") ? base : `${base}/`;
};

export const getTaskSourcePromise = (
  version: TaskVersion,
): Promise<Result<Map<number, TaskSource[]>, Error>> => {
  const taskSource = taskSourceMap.get(version);
  if (taskSource) {
    return taskSource;
  }

  const dataUrl = `${tasksBaseUrl}${version}.json`;
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
