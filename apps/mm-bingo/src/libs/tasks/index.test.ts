import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

import { taskVersions } from "../../features/store/versions/taskVersion";
import { generate5x5MagicSquare } from "./generate/magicSquare";
import { generateTasksResilient } from "./generate/resilient";
import { ALGORITHM_BY_VERSION, generateTasksAsync, isEmptyTask } from "./index";
import { getTaskSourcePromise, setTasksBaseUrl } from "./taskSource";

// Versions using the "legacy" algorithm are closed/frozen (changing them
// would change already-shared boards) and have known, accepted empty-task
// rates — see ALGORITHM_BY_VERSION in ./index.ts. Only versions using the
// newer "resilient" algorithm are expected to actually meet the zero
// tolerance this test enforces.
const resilientTaskVersions = taskVersions.filter(
  (version) => ALGORITHM_BY_VERSION[version] === "resilient",
);

const SEED_SAMPLE_SIZE = 100_000;

beforeAll(() => {
  // taskSource.ts defaults to resolving tasks/ against its own module URL,
  // which only lines up in a built deployment (dist/task.js sits next to
  // dist/tasks/). Under vitest the module is still at src/libs/tasks/, so
  // pin the base the same way the app does — the stub below expects a URL
  // ending in exactly one "/tasks/<version>.json".
  setTasksBaseUrl("/tasks/");

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const url = input.toString();
      const match = /\/tasks\/(.+)\.json$/.exec(url);
      if (!match) {
        throw new Error(`Unexpected fetch URL in test: ${url}`);
      }

      const filePath = resolve(
        import.meta.dirname,
        "../../../public/tasks",
        `${match[1]}.json`,
      );
      const body = await readFile(filePath, "utf-8");

      return new Response(body, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }),
  );
});

describe.each(resilientTaskVersions)("generateTasksAsync (%s)", (version) => {
  it(`never falls back to the empty task across ${SEED_SAMPLE_SIZE} seeds`, async () => {
    const seedsWithEmptyTasks: number[] = [];

    for (let seed = 0; seed < SEED_SAMPLE_SIZE; seed++) {
      const result = await generateTasksAsync(seed, version);
      expect(result.ok).toBe(true);
      if (!result.ok) {
        continue;
      }

      if (result.value.some((task) => isEmptyTask(task))) {
        seedsWithEmptyTasks.push(seed);
      }
    }

    expect(seedsWithEmptyTasks).toEqual([]);
  });

  // Every task in a "resilient" version's pool must have gone through
  // scripts/calibrateTaskWeights.ts (see TaskSource.weight and
  // generate/resilient.ts's defaultTaskWeight) — a task added or retagged
  // without recalibrating silently falls back to an unweighted pick at
  // runtime (harmless, but defeats the point: see the next test), so this
  // catches "forgot to run the calibration script" immediately rather
  // than waiting to notice the fairness regression it causes.
  it("has a calibrated weight on every task", async () => {
    const maybeTaskMap = await getTaskSourcePromise(version);
    expect(maybeTaskMap.ok).toBe(true);
    if (!maybeTaskMap.ok) {
      return;
    }

    const unweighted = [...maybeTaskMap.value.values()]
      .flat()
      .filter((task) => typeof task.weight !== "number")
      .map((task) => `${task.difficulty}::${task.text.en}`);

    expect(unweighted).toEqual([]);
  });

  // Being technically placeable isn't the same as actually showing up: a
  // task whose tags are shared with many others across the pool gets
  // excluded by an earlier same-tag placement far more often than a
  // uniquely-tagged one, so a *uniform* pick among eligible candidates
  // would leave some tasks eligible so rarely they all but never actually
  // appear on a generated board — that's what each task's calibrated
  // `weight` (see the previous test and defaultTaskWeight in
  // generate/resilient.ts) compensates for. The floor is deliberately
  // well short of the ~80-110% spread scripts/calibrateTaskWeights.ts
  // reports on a fresh calibration — this isn't re-asserting that exact
  // number (this test's own sample is smaller and independently seeded,
  // so some statistical noise is expected), it's catching a *materially*
  // stale or broken calibration, e.g. weights left over from a since-
  // edited tag set.
  it("gives every task at least a reasonable shot at appearing", async () => {
    const FAIRNESS_SAMPLE_SIZE = 20_000;
    const MIN_SHARE_OF_NAIVE_UNIFORM_RATE = 0.3;

    const maybeTaskMap = await getTaskSourcePromise(version);
    expect(maybeTaskMap.ok).toBe(true);
    if (!maybeTaskMap.ok) {
      return;
    }
    const taskMap = maybeTaskMap.value;

    const appearances = new Map<string, number>();
    for (const [difficulty, tasks] of taskMap) {
      for (const task of tasks) {
        appearances.set(`${difficulty}::${task.text.en}`, 0);
      }
    }

    for (let seed = 0; seed < FAIRNESS_SAMPLE_SIZE; seed++) {
      const magicSquare = generate5x5MagicSquare({ seed });
      for (const task of generateTasksResilient(seed, magicSquare, taskMap)) {
        if (isEmptyTask(task)) {
          continue;
        }
        const key = `${task.difficulty}::${task.text.en}`;
        appearances.set(key, (appearances.get(key) ?? 0) + 1);
      }
    }

    const starved = [...appearances.entries()].flatMap(([key, count]) => {
      const [difficultyRaw] = key.split("::");
      const tierSize = taskMap.get(Number(difficultyRaw))?.length ?? 1;
      const naiveUniformRate = 1 / tierSize;
      const actualRate = count / FAIRNESS_SAMPLE_SIZE;
      return actualRate < naiveUniformRate * MIN_SHARE_OF_NAIVE_UNIFORM_RATE
        ? [
            `${key} (${(actualRate * 100).toFixed(2)}% vs. floor ${(naiveUniformRate * MIN_SHARE_OF_NAIVE_UNIFORM_RATE * 100).toFixed(2)}%)`,
          ]
        : [];
    });

    expect(starved).toEqual([]);
  });
});
