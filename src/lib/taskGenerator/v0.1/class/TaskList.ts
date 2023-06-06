import { Task } from "@/types/task";
import { TaskData } from "@/types/taskData";

export class TaskList {
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
        // difficulties of all tasks are defined from 1 to 25 so subtract 1.
        difficulty: taskInfo.difficulty - 1,
        text: taskInfo.contents[lang],
        filter,
        lineTypes: [],
        trackers: taskInfo.trackers,
      };
    });
  }

  getTasksByWeight = (weight: number): Task[] =>
    this.tasks.filter((v) => v.difficulty === weight);
}
