import {
  CARD_CELL_PX,
  HEADER_PX,
  HORZ_CELL_WIDTH,
  HORZ_CELL_HEIGHT,
  VERT_CELL_WIDTH,
  VERT_CELL_HEIGHT,
} from "@/const/popupWindowFeatures";
import { LayoutName } from "@/types/layout";

export const CalcPopupWindowFeatures = (
  layoutName: LayoutName,
  cellCount: number
): string => {
  const size = (() => {
    if (layoutName === "card") {
      return `width=${CARD_CELL_PX * cellCount},height=${
        CARD_CELL_PX * cellCount + HEADER_PX
      }`;
    } else if (layoutName === "horizontal") {
      return `width=${HORZ_CELL_WIDTH * cellCount},height=${HORZ_CELL_HEIGHT + HEADER_PX}`;
    } else if (layoutName === "vertical") {
      return `width=${VERT_CELL_WIDTH},height=${VERT_CELL_HEIGHT * cellCount + HEADER_PX}`;
    }
    throw new Error("Unknown Error.");
  })();

  return `${size},noOpener,noReferrer`;
};
