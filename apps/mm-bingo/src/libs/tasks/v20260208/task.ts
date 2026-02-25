import type { LineType } from "./lineTypes";
import { type Tracker } from "../tracker/tracker";

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

export const createPlaceholderTask = (text: {
  ja: "(?????)";
  en: "(Empty)";
}): Task => ({
  difficulty: 0,
  tags: new Set(),
  text: text,
  lineTypes: [],
  trackers: [],
});

export const emptyTask: Task = {
  difficulty: 0,
  tags: new Set(),
  text: {
    ja: "(空のタスク)",
    en: "(Empty Task)",
  },
  lineTypes: [],
  trackers: [],
};
