import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

import type { TaskVersion } from "../../../features/store/versions/taskVersion";
import { taskVersions } from "../../../features/store/versions/taskVersion";
import goldenBoardsJson from "../__fixtures__/legacyGoldenBoards.json";
import { ALGORITHM_BY_VERSION, generateTasksAsync } from "../index";
import { setTasksBaseUrl } from "../taskSource";

type GoldenBoard = { d: number; en: string; lt: string[] }[] | null;

// Only ever has entries for legacy versions (see the fixture-generation
// note below) — indexed with the full TaskVersion union just because
// that's what taskVersions.filter() below leaves version typed as.
const goldenBoards = goldenBoardsJson as Partial<
  Record<TaskVersion, GoldenBoard[]>
>;

const legacyVersions = taskVersions.filter(
  (v) => ALGORITHM_BY_VERSION[v] === "legacy",
);
const N = 100;

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
        "../../../../public/tasks",
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

// generateTasksLegacy is documented as kept byte-for-byte forever — an
// already-shared board has to keep matching its seed. This is what
// actually enforces that, instead of just a comment asking nicely: it
// diffs live output against __fixtures__/legacyGoldenBoards.json (a
// snapshot of what these seeds produce today) for every legacy version,
// so any future change to generateTasksLegacy, legacyShuffleArray, or the
// shared magic-square/line-type code it depends on gets caught here
// immediately, no matter how indirect.
//
// If a change to this fixture is ever actually intended, it can only mean
// one thing: a *new* task-version is being declared, with its own fresh
// seed space nobody has shared boards from yet — never an edit to an
// existing legacy version's output.
describe.each(legacyVersions)(
  "generateTasksLegacy (%s) is frozen",
  (version) => {
    it(`matches the golden snapshot across ${N} seeds`, async () => {
      const boards = [];
      for (let seed = 0; seed < N; seed++) {
        const result = await generateTasksAsync(seed, version);
        boards.push(
          result.ok
            ? result.value.map((t) => ({
                d: t.difficulty,
                en: t.text.en,
                lt: t.lineTypes,
              }))
            : null,
        );
      }
      expect(boards).toEqual(goldenBoards[version]);
    });
  },
);
