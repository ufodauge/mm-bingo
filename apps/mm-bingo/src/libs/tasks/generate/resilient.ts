import type { LineType, Task, TaskSource } from "../../types";
import { emptyTask } from "../emptyTask";
import { SplitMix64 } from "../random";
import { getLineTypesByIndex } from "./magicSquare";

export const canPlaceTaskOnLines = (
  task: TaskSource,
  lineTypes: readonly LineType[],
  tagsByLines: Partial<Record<LineType, Set<string>>>,
): boolean => {
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
};

// The magic square always uses each of 1..25 exactly once (see
// generate5x5MagicSquare), so a cell's difficulty tier is never outside
// this range — fallback offsets that would land outside it are skipped.
const DIFFICULTY_MIN = 1;
const DIFFICULTY_MAX = 25;

// Closest tier first, alternating sides so the fallback doesn't
// systematically skew every board easier (or harder) than intended.
const FALLBACK_OFFSETS = [0, -1, 1];

export type TaskWeightFn = (task: TaskSource) => number;

// A task's default weight is `TaskSource.weight` as calibrated by
// scripts/calibrateTaskWeights.ts (see that script for the full
// explanation) — a task whose tags are shared with many others is
// excluded far more often than one with a rare or unique tag (any one of
// those other tasks getting placed first, anywhere on a shared line,
// rules it out), so left unweighted, some tasks are eligible so rarely
// they all but never actually appear on a board even though nothing is
// technically stopping them. `weight` is optional in the data — a task
// missing one (never calibrated) falls back to 1, same as every task
// before calibration existed at all — but scripts/checkTaskWeights.ts is
// what CI runs to make sure that fallback is never silently relied on.
export const defaultTaskWeight: TaskWeightFn = (task) => task.weight ?? 1;

// Picks among already-eligible candidates with probability proportional
// to `weightOf` instead of uniformly — see defaultTaskWeight for why a
// uniform pick would systematically starve some tasks.
const pickWeighted = (
  candidates: readonly TaskSource[],
  weightOf: TaskWeightFn,
  rng: SplitMix64,
): TaskSource => {
  const weights = candidates.map(weightOf);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let remaining = rng.next() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    remaining -= weights[i];
    if (remaining <= 0) {
      return candidates[i];
    }
  }
  return candidates[candidates.length - 1];
};

// Tries the exact difficulty tier first; if it has no tasks at all, or
// every candidate collides with a tag already used on one of this cell's
// lines, retries with the neighboring tiers before giving up. This is what
// lets the "resilient" algorithm recover from gaps in the task pool that
// would otherwise produce an empty task.
const pickTaskWithFallback = (
  taskMap: Map<number, TaskSource[]>,
  exactDifficulty: number,
  lineTypes: readonly LineType[],
  tagsByLines: Partial<Record<LineType, Set<string>>>,
  weightOf: TaskWeightFn,
  rng: SplitMix64,
): { task: TaskSource; isFallback: boolean } | undefined => {
  for (const offset of FALLBACK_OFFSETS) {
    const difficulty = exactDifficulty + offset;
    if (difficulty < DIFFICULTY_MIN || difficulty > DIFFICULTY_MAX) {
      continue;
    }
    const tasks = taskMap.get(difficulty);
    if (!tasks) {
      continue;
    }
    const candidates = tasks.filter((t) =>
      canPlaceTaskOnLines(t, lineTypes, tagsByLines),
    );
    if (candidates.length === 0) {
      continue;
    }
    return {
      task: pickWeighted(candidates, weightOf, rng),
      isFallback: offset !== 0,
    };
  }
  return undefined;
};

// The actual board fill, parameterized on `weightOf` so
// scripts/calibrateTaskWeights.ts can drive the exact same logic
// production uses with its own in-progress weight map, rather than
// keeping a second copy of the fill order / fallback / collision rules
// that could drift out of sync with the real thing.
export const generateTasksResilientWithWeights = (
  seed: number,
  magicSquare: readonly number[],
  taskMap: Map<number, TaskSource[]>,
  weightOf: TaskWeightFn,
): Task[] => {
  const rng = new SplitMix64(seed);
  const tagsByLines: Partial<Record<LineType, Set<string>>> = {};

  const cellLineTypes = magicSquare.map((_, i) =>
    getLineTypesByIndex(i, 5).filter((v) => v !== "card"),
  );

  // Most-constrained-first: cells sitting on more lines (the two diagonals
  // overlap every row/col, and each other at the center) run out of
  // non-colliding candidates sooner, so give them first pick while the
  // fewest tags have been used yet instead of filling in raster order.
  const fillOrder = magicSquare
    .map((_, i) => i)
    .sort((a, b) => cellLineTypes[b].length - cellLineTypes[a].length || a - b);

  const result: Task[] = new Array(magicSquare.length);

  for (const i of fillOrder) {
    const lineTypes = cellLineTypes[i];
    const pick = pickTaskWithFallback(
      taskMap,
      magicSquare[i] + 1,
      lineTypes,
      tagsByLines,
      weightOf,
      rng,
    );

    if (pick === undefined) {
      result[i] = emptyTask;
      continue;
    }

    const { task, isFallback } = pick;
    for (const lineType of lineTypes) {
      tagsByLines[lineType] ??= new Set();
      for (const tag of task.tags.values()) {
        tagsByLines[lineType].add(tag);
      }
    }

    result[i] = {
      difficulty: task.difficulty,
      lineTypes,
      tags: task.tags,
      text: task.text,
      trackers: task.trackers,
      isFallback,
    };
  }

  return result;
};

// The improved algorithm introduced with v20260718 to cut down on empty
// tasks (see ALGORITHM_BY_VERSION in ./index.ts and pickTaskWithFallback
// above for how) and, via each task's calibrated weight, on tasks that
// are technically possible but so consistently crowded out by a popular
// tag that they almost never actually show up (see defaultTaskWeight).
export const generateTasksResilient = (
  seed: number,
  magicSquare: readonly number[],
  taskMap: Map<number, TaskSource[]>,
): Task[] =>
  generateTasksResilientWithWeights(
    seed,
    magicSquare,
    taskMap,
    defaultTaskWeight,
  );
