import type { Tracker } from "./tasks/tracker/tracker";

type LineTypeColOrRow = `${"row" | "col"}${number}`;
export type LineType = `${"card" | "tlbr" | "bltr" | LineTypeColOrRow}`;

export type TaskSource = {
  difficulty: number;
  text: Partial<Record<string, string>>;
  tags: Set<string>;
  trackers: Tracker[];
};

export type Task = {
  difficulty: number;
  text: Partial<Record<string, string>>;
  tags: Set<string>;
  lineTypes: LineType[];
  trackers: Tracker[];
};
