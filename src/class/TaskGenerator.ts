import { getLineTypesByIndex } from "@/lib/getLineTypeByIndex";
import { Task } from "@/types/task";

import MagicSquare from "./MagicSquare";
import TaskList from "./TaskList";
import { TaskData } from "./taskData";

export default function TaskGenerator(taskData: TaskData, seed: number, lang: string): Task[] {
  const DISPLAY_TASKS = taskData.size ** 2;
  const magicSquare = new MagicSquare(taskData.size, seed);
  const taskList = new TaskList(taskData.data, lang);

  const tasks: Task[] = [...Array<Task>(DISPLAY_TASKS)].map((_, position) => {
    const difficulty = magicSquare.getDifficulty(position);

    const task = magicSquare.getAssignableTask(
      taskList.getTasksByDifficulty(difficulty),
      position
    );

    return task;
  });

  // generate tasks
  const result: Task[] = tasks.map((task, i) => {
    task.lineTypes = getLineTypesByIndex(i);
    return task;
  });

  return result;
}
