import { Tracker } from "./tracker";

export type TaskData = {
  title: string;
  size: number;
  lang: string[];
  description: string;
  version: {
    major: number;
    minor: number;
    revision: number;
  };
  data: {
    difficulty: number;
    contents: string[];
    trackers?: Tracker[];
  }[];
};
