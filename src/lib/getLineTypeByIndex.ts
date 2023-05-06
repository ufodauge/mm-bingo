import { taskData } from "@/const/TaskData";
import { LineType } from "@/types/lineType";

export const getLineTypesByIndex = (i: number): LineType[] => {
  const result: LineType[] = ["card"];

  // cols
  const colIndex = (i % taskData.size) + 1;
  result.push(`col${colIndex}`);

  // rows
  const rowIndex = Math.floor(i / taskData.size) + 1;
  result.push(`row${rowIndex}`);

  // tlbr
  if (i % (taskData.size + 1) === 0) {
    result.push("tlbr");
  }

  // bltr
  const BLTR = [...Array(taskData.size)].map(
    (_, j) => (j + 1) * (taskData.size - 1)
  );
  if (BLTR.includes(i)) {
    result.push("bltr");
  }

  return result;
};
