import { LineType } from "@/types/lineType";
import { Task } from "@/types/task";

export const getTargetTasksByLineType = (tasks: Task[], lineType: LineType): Task[] => {
  const result: Task[] = [];
  tasks
    .filter((v) => v.lineTypes.find((v) => v === lineType))
    .forEach((v) => result.push(v));
  return result;
};
