import * as vb from "valibot";
import { shuffleArray, SplitMix64 } from "./random";
import { type Task, type TaskSource, emptyTask } from "./task";
import dataUrl from "./data.json?url";
import { err, ok, type Result } from "./result";
import { taskSourceListSchema } from "./schema";
import type { LineType } from "./lineTypes";

const taskSourcePromise: Promise<Result<Map<number, TaskSource[]>, Error>> =
  fetch(dataUrl)
    .then(async (v) => {
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
          }),
        ),
        (v) => v.difficulty,
      );

      return ok(grouped);
    })
    .catch((v) => err(v instanceof Error ? v : Error(v)));

export const getLineTypesByIndex = (
  i: number,
  cellCount: number,
): LineType[] => {
  const result: LineType[] = ["card"];

  // cols
  const colIndex = (i % cellCount) + 1;
  result.push(`col${colIndex}`);

  // rows
  const rowIndex = Math.floor(i / cellCount) + 1;
  result.push(`row${rowIndex}`);

  // tlbr
  if (i % (cellCount + 1) === 0) {
    result.push("tlbr");
  }

  // bltr
  const BLTR = [...Array(cellCount)].map((_, j) => (j + 1) * (cellCount - 1));
  if (BLTR.includes(i)) {
    result.push("bltr");
  }

  return result;
};

const RAND_MAX = 1000000;

// https://ja.wikipedia.org/wiki/%E9%AD%94%E6%96%B9%E9%99%A3#5%C3%975%E3%81%AE%E9%AD%94%E6%96%B9%E9%99%A3%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9
const generate5x5MagicSquare = ({ seed }: { seed: number }) => {
  const size = 5;
  const rng = new SplitMix64(seed);

  const numerators = shuffleArray(
    Array.from({ length: size }, (_, i) => size * i),
    rng.nextInt(0, RAND_MAX),
  );
  const denominators = shuffleArray(
    Array.from({ length: size }, (_, i) => i),
    rng.nextInt(0, RAND_MAX),
  );

  const result = Array.from({ length: size ** 2 }, (_, i) => {
    const x = Math.floor(i / size);
    const y = i % size;

    return numerators[(x * 3 + y) % size] + denominators[(y * 3 + x) % size];
  });

  return result;
};

export const generateTasksAsync = async (
  seed: number,
): Promise<Result<Task[], Error>> => {
  const rng = new SplitMix64(seed);

  const maybeTaskMap = await taskSourcePromise;
  if (!maybeTaskMap.ok) {
    return maybeTaskMap;
  }
  const taskMap = maybeTaskMap.value;

  const magicSquare = generate5x5MagicSquare({ seed });

  const tagsByLines: Partial<Record<LineType, Set<string>>> = {};

  const result: Task[] = magicSquare.map((v, i) => {
    const tasks = taskMap.get(v + 1);
    if (!tasks) {
      return emptyTask;
    }

    const lineTypes = getLineTypesByIndex(i, 5).filter((v) => v !== "card");
    const pickedTask = shuffleArray(tasks, rng.nextInt(0, 1000000)).find(
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

  return ok(result);
};
