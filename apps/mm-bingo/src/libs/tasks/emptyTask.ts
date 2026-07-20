import type { Task } from "../types";

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

export const isEmptyTask = (task: Task): boolean => task === emptyTask;
export const isFallbackTask = (task: Task): boolean => task.isFallback === true;
