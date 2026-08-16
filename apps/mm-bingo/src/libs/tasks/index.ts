import type { TaskVersion } from "../../features/store/versions/taskVersion";
import { ok, type Result } from "../result";
import type { Task } from "../types";
import { generateTasksLegacy } from "./generate/legacy";
import { legacyShuffleArray } from "./generate/legacyShuffle";
import { generate5x5MagicSquare } from "./generate/magicSquare";
import { generateTasksResilient } from "./generate/resilient";
import { getTaskSourcePromise } from "./taskSource";

export { emptyTask, isEmptyTask, isFallbackTask } from "./emptyTask";
export { setTasksBaseUrl } from "./taskSource";

// Which task-generation algorithm a version uses. "legacy" is the original
// algorithm (see generate/legacy.ts) — kept byte-for-byte for already-
// released versions so their seeds keep producing the same board.
// "resilient" is the improved one (see generate/resilient.ts) introduced
// with v20260718 to cut down on empty tasks. Adding a version to
// TaskVersion without adding it here is a type error by design — every
// version must make this choice explicitly.
export const ALGORITHM_BY_VERSION: Record<TaskVersion, "legacy" | "resilient"> =
  {
    v20260208: "legacy",
    v20260409: "legacy",
    v20260419: "legacy",
    v20260718: "resilient",
  };

export const generateTasksAsync = async (
  seed: number,
  version: TaskVersion,
): Promise<Result<Task[], Error>> => {
  const maybeTaskMap = await getTaskSourcePromise(version);
  if (!maybeTaskMap.ok) {
    return maybeTaskMap;
  }
  const taskMap = maybeTaskMap.value;
  const isLegacy = ALGORITHM_BY_VERSION[version] === "legacy";

  // A legacy version's magic square layout — not just its task picks —
  // has to keep matching its seed byte-for-byte too, so it needs the same
  // frozen shuffle its task picking does (see generate/legacyShuffle.ts).
  const magicSquare = isLegacy
    ? generate5x5MagicSquare({ seed }, legacyShuffleArray)
    : generate5x5MagicSquare({ seed });

  const result = isLegacy
    ? generateTasksLegacy(seed, magicSquare, taskMap)
    : generateTasksResilient(seed, magicSquare, taskMap);

  return ok(result);
};
