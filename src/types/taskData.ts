import { Tracker } from "./tracker";

export type TaskData = {
  repoName: string;
  title: string;
  size: number;
  lang: string[];
  description: { [key: string]: string };
  version: {
    major: number;
    minor: number;
    revision: number;
  };
  data: {
    difficulty: number;
    contents: { [key: string]: string };
    trackers: Tracker[];
    tag: string[];
  }[];
};
