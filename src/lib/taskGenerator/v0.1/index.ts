import { Task } from "@/types/task";
import { TaskData } from "@/types/taskData";
import { TaskField } from "./class/TaskField";

export const generateTasks = (
  taskData: TaskData,
  seed: number,
  lang: string
): Task[] => {
  const taskField = new TaskField(taskData.size, seed, lang);

  const tasks = taskField.generateTasks(taskData.data);

  return tasks;
};
