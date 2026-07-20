// Calibrates each task's `weight` field (see TaskSource.weight and
// generate/resilient.ts's defaultTaskWeight) by simulation: repeatedly
// generate boards, measure how often each task actually appears, and
// nudge its weight toward the naive "1 / candidates in its tier" target —
// a form of iterative proportional fitting (IPF). Left at weight 1 (or
// any static, non-simulated approximation), a task whose tags are shared
// with many others across the pool gets excluded far more often than one
// with a rare tag, since any one of those other tasks being placed first
// on a shared line rules it out — some tasks ended up so rarely eligible
// they all but never appeared on a real board at all. This is what fixes
// that at the source instead of just detecting it.
//
// Run whenever a version's task pool changes (tags added/removed, tasks
// added/removed) — scripts/checkTaskWeights.ts (run in CI, via `pnpm
// test`) fails the build if a task is missing a weight, so this isn't
// optional to skip.
//
// Usage:
//   node scripts/calibrateTaskWeights.ts [version]
//   (omit version to calibrate every version using the "resilient"
//   algorithm)

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import * as vb from "valibot";

import {
  taskVersions,
  type TaskVersion,
} from "../src/features/store/versions/taskVersion";
import { isEmptyTask } from "../src/libs/tasks/emptyTask";
import { generate5x5MagicSquare } from "../src/libs/tasks/generate/magicSquare";
import { generateTasksResilientWithWeights } from "../src/libs/tasks/generate/resilient";
import { ALGORITHM_BY_VERSION } from "../src/libs/tasks/index";
import { taskSourceListSchema } from "../src/libs/tasks/schema";
import type { TaskSource } from "../src/libs/types";

const SEEDS_PER_ROUND = 20_000;
const ROUNDS = 8;
const LEARNING_RATE = 0.7; // damping factor; <1 avoids oscillation/overshoot
const WEIGHT_FLOOR = 0.05;
const WEIGHT_DECIMALS = 3;

type RawTaskEntry = { weight?: number } & Record<string, unknown>;

const taskKey = (difficulty: number, en: string): string =>
  `${difficulty}::${en}`;

const calibrateVersion = async (version: TaskVersion): Promise<void> => {
  const filePath = resolve(
    import.meta.dirname,
    "../public/tasks",
    `${version}.json`,
  );
  const rawJson = JSON.parse(
    await readFile(filePath, "utf-8"),
  ) as RawTaskEntry[];
  const parsed = vb.parse(taskSourceListSchema, rawJson);

  const sources: TaskSource[] = parsed.map((v) => ({
    difficulty:
      typeof v.difficulty === "number"
        ? v.difficulty
        : Number.parseInt(v.difficulty),
    tags: new Set(v.tag),
    text: v.contents,
    trackers: v.trackers,
    weight: 1,
  }));
  const taskMap = Map.groupBy(sources, (t) => t.difficulty);
  const tierSize = new Map<number, number>();
  for (const [difficulty, tasks] of taskMap) {
    tierSize.set(difficulty, tasks.length);
  }

  const weightByKey = new Map<string, number>();
  for (const source of sources) {
    weightByKey.set(taskKey(source.difficulty, source.text.en ?? ""), 1);
  }
  const weightOf = (t: TaskSource): number =>
    weightByKey.get(taskKey(t.difficulty, t.text.en ?? "")) ?? 1;

  const simulateRound = (seedOffset: number): Map<string, number> => {
    const appearances = new Map<string, number>();
    for (let s = 0; s < SEEDS_PER_ROUND; s++) {
      const seed = seedOffset + s;
      const magicSquare = generate5x5MagicSquare({ seed });
      const tasks = generateTasksResilientWithWeights(
        seed,
        magicSquare,
        taskMap,
        weightOf,
      );
      for (const task of tasks) {
        if (isEmptyTask(task)) {
          continue;
        }
        const key = taskKey(task.difficulty, task.text.en ?? "");
        appearances.set(key, (appearances.get(key) ?? 0) + 1);
      }
    }
    return appearances;
  };

  for (let round = 0; round < ROUNDS; round++) {
    const appearances = simulateRound(round * 1_000_000);

    let minRel = Infinity;
    let maxRel = -Infinity;
    for (const [key, currentWeight] of weightByKey) {
      const [difficultyRaw] = key.split("::");
      const target = 1 / (tierSize.get(Number(difficultyRaw)) ?? 1);
      const actual = (appearances.get(key) ?? 0) / SEEDS_PER_ROUND;
      minRel = Math.min(minRel, actual / target);
      maxRel = Math.max(maxRel, actual / target);

      // Multiplicative correction toward the target rate, damped by
      // LEARNING_RATE. The floor under `actual` keeps a task that scored
      // zero this round from being assigned a runaway/infinite weight.
      const ratio = target / Math.max(actual, 1 / (SEEDS_PER_ROUND * 4));
      const correction = 1 + (ratio - 1) * LEARNING_RATE;
      weightByKey.set(key, Math.max(WEIGHT_FLOOR, currentWeight * correction));
    }

    console.log(
      `[${version}] round ${round + 1}/${ROUNDS}: spread ${(minRel * 100).toFixed(1)}% .. ${(maxRel * 100).toFixed(1)}% of naive-uniform`,
    );
  }

  rawJson.forEach((entry, i) => {
    const source = sources[i];
    const weight =
      weightByKey.get(taskKey(source.difficulty, source.text.en ?? "")) ?? 1;
    entry.weight =
      Math.round(weight * 10 ** WEIGHT_DECIMALS) / 10 ** WEIGHT_DECIMALS;
  });

  await writeFile(filePath, `${JSON.stringify(rawJson, null, 2)}\n`, "utf-8");
  console.log(`[${version}] wrote calibrated weights to ${filePath}`);
};

const requestedVersion = process.argv[2];
const versionsToCalibrate = requestedVersion
  ? [requestedVersion as TaskVersion]
  : taskVersions.filter((v) => ALGORITHM_BY_VERSION[v] === "resilient");

for (const version of versionsToCalibrate) {
  if (ALGORITHM_BY_VERSION[version] !== "resilient") {
    console.error(
      `${version} uses the "legacy" algorithm, which has no weighting to calibrate — skipping.`,
    );
    continue;
  }
  // Deliberately sequential — logs from different versions shouldn't interleave.
  await calibrateVersion(version);
}
