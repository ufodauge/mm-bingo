import type { Tracker } from "./tracker/tracker";

type LineTypeColOrRow = `${"row" | "col"}${number}`;
export type LineType = `${"card" | "tlbr" | "bltr" | LineTypeColOrRow}`;

export type TaskSource = {
  difficulty: number;
  text: Partial<Record<string, string>>;
  tags: Set<string>;
  trackers: Tracker[];
  // How strongly the "resilient" generation algorithm prefers this task
  // over other eligible candidates for the same slot — see
  // generate/resilient.ts's defaultTaskWeight and
  // scripts/calibrateTaskWeights.ts for how it's calibrated. Absent for
  // tasks that have never been through calibration (falls back to 1, an
  // unweighted pick) — scripts/checkTaskWeights.ts is what stops that
  // from silently shipping.
  weight?: number;
};

export type Task = {
  difficulty: number;
  text: Partial<Record<string, string>>;
  tags: Set<string>;
  lineTypes: LineType[];
  trackers: Tracker[];
  // True when the generator (see libs/tasks/index.ts's "resilient"
  // algorithm) couldn't find a candidate at this cell's exact difficulty
  // tier and substituted an adjacent one instead. Absent/false for tasks
  // picked at their exact difficulty, and for the legacy algorithm, which
  // never does this.
  isFallback?: boolean;
};
