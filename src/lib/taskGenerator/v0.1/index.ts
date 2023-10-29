import { Task } from "@/types/task";
import { TaskData } from "@/types/taskData";
import { TaskField } from "./class/TaskField";

export const generateTasks = (
  taskData: TaskData,
  seed: number,
  lang: string
): [Task[], boolean] => {
  const taskField = new TaskField(taskData.size, seed, lang);

  const [tasks, causedError] = taskField.generateTasks(taskData.data);

  return [tasks, causedError];
};

const createEmptyTask = () => {
  return {
    index     : 0,
    difficulty: 0,
    text      : "-",
    filter    : BigInt(0),
    lineTypes : [],
    trackers  : [],
  };
};

export const generateEmptyTasks = (taskData: TaskData): Task[] => {
  return [...new Array<Task>(taskData.size)].map((_) => createEmptyTask());
};