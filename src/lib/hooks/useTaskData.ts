import { TaskData } from "@/class/taskData";
import data from "@/data/data.json";

const DEFAULT_TASK_DATA = new TaskData(data);

export const useTaskData = () => {
  return DEFAULT_TASK_DATA;
};
