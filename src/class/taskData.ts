import { Tracker } from "@/types/tracker";

export class TaskData {
  readonly repoName: string;
  readonly title: string;
  readonly size: number;
  readonly lang: string[];
  readonly description: { [key: string]: string };
  readonly version: {
    major: number;
    minor: number;
    revision: number;
  };
  readonly data: {
    difficulty: number;
    contents: { [key: string]: string };
    trackers?: Tracker[];
    tag?: string[];
  }[];

  constructor(data: any) {
    this.repoName = data.repoName ?? "";
    this.title = data.title ?? "";
    this.size = Math.floor(data.size ?? 5);
    this.lang = data.lang ?? ["en"];
    this.description = data.description ?? { en: "" };
    this.data = data.data ?? [];
    this.version = data.version ?? {
      major: 0,
      minor: 0,
      revision: 0,
    };
  }
}
