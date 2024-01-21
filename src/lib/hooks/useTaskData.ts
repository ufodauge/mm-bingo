import { TaskData } from "@/types/taskData";
import data from "@/data/data.json";

const DEFAULT_TASK_DATA = (() => {
  return {
    ...data,
    data: data.data.map((v) => {
      return {
        ...v,
        tag: v.tag || [],
        trackers: v.trackers || [],
      };
    }),
  };
})();

export const useTaskData = () => {
  return DEFAULT_TASK_DATA;
};
