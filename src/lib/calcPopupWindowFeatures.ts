import { taskData } from "@/const/TaskData";
import { LayoutName } from "@/types/layout";

const HEADER_SIZE = 40;
const CARD_CELL_SIZE = 168;
const VERT_CELL_SIZE = 140;
const HORZ_CELL_SIZE = 240;

export const CalcPopupWindowFeatures = (layoutName: LayoutName): string => {
  const cellCount = taskData.size;
  const size = (() => {
    if (layoutName === "card") {
      return `width=${CARD_CELL_SIZE * cellCount},height=${
        CARD_CELL_SIZE * cellCount + HEADER_SIZE
      }`;
    } else if (layoutName === "horizontal") {
      return `width=${HORZ_CELL_SIZE * cellCount},height=180`;
    } else if (layoutName === "vertical") {
      return `width=280,height=${VERT_CELL_SIZE * cellCount}`;
    }
    throw new Error("Unknown Error.");
  })();

  console.log(size);

  return `${size},noOpener,noReferrer`;
};
