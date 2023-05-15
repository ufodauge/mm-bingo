import { Task } from "@/types/task";

import { TaskData } from "./taskData";

export default class TaskList {
  private tasks: Task[];
  private tagList: string[];

  constructor(taskData: TaskData["data"], lang: string) {
    this.tasks = [];
    this.tagList = [];

    this.tasks = taskData.map((taskInfo, i) => {
      taskInfo.tag.forEach((v) => {
        if (!this.tagList.includes(v)) {
          this.tagList.push(v);
        }
      });

      const filter = this.tagList.reduce(
        (prev, v, j) =>
          prev +
          (taskInfo.tag.includes(v) ? BigInt(0b1) << BigInt(j) : BigInt(0b0)),
        BigInt(0b0)
      );

      return {
        index: i,
        difficulty: taskInfo.difficulty,
        text: taskInfo.contents[lang],
        filter,
        lineTypes: [],
        trackers: taskInfo.trackers,
      };
    });
  }

  getTasksByDifficulty = (difficulty: number): Task[] =>
    this.tasks.filter((v) => v.difficulty === difficulty);
}
