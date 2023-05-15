import { LineType } from "@/types/lineType";

export const getLineTypesByIndex = (i: number, cellCount: number): LineType[] => {
  const result: LineType[] = ["card"];

  // cols
  const colIndex = (i % cellCount) + 1;
  result.push(`col${colIndex}`);

  // rows
  const rowIndex = Math.floor(i / cellCount) + 1;
  result.push(`row${rowIndex}`);

  // tlbr
  if (i % (cellCount + 1) === 0) {
    result.push("tlbr");
  }

  // bltr
  const BLTR = [...Array(cellCount)].map(
    (_, j) => (j + 1) * (cellCount - 1)
  );
  if (BLTR.includes(i)) {
    result.push("bltr");
  }

  return result;
};
