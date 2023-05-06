import { Task } from "@/types/task";
import { Tracker } from "@/types/tracker";

type TaskListProps = {
  difficulty: number;
  contents: { [key: string]: string };
  trackers?: Tracker[];
  tags?: string[];
};

export default class TaskList {
  private tasks: Task[];
  private tagList: string[];

  constructor(taskData: TaskListProps[], lang: string) {
    this.tasks = [];
    this.tagList = [];

    taskData.forEach((taskInfo, i) => {
      taskInfo.tags?.forEach((v) => {
        if (!this.tagList.includes(v)) {
          this.tagList.push(v);
        }
      });

      const filter = this.tagList.reduce(
        (prev, v) => prev + (taskInfo.tags?.includes(v) ? 0b1 << i : 0b0),
        0b0
      );

      this.tasks.push({
        index: i,
        difficulty: taskInfo.difficulty,
        text: taskInfo.contents[lang],
        filter,
        lineTypes: [],
        trackers: taskInfo.trackers ?? [],
      });
    });
  }

  getTasksByDifficulty = (difficulty: number): Task[] =>
    this.tasks.filter((v) => v.difficulty === difficulty);
}
