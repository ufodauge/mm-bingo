import { ReactNode } from "react";

import { useTaskData } from "@/lib/hooks/useTaskData";

import PopoutButton from "./button/popoutButton";
import PopoutCols from "./popoutCols";
import PopoutRows from "./popoutRows";
import { container } from "./popouts.css";
import { minCellSize } from "./index.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { CARD_CELL_PX } from "@/const/popupWindowFeatures";

type Props = {
  children: ReactNode;
};

export default function PopoutButtons({ children }: Props) {
  const taskData = useTaskData();

  const boardSize = taskData.size;

  // const templateColumns = `${minCellSize}px ${CARD_CELL_PX * boardSize}px`;
  const templateColumns = `${minCellSize}px 1fr`;
  const templateRows = [
    `${minCellSize}px`,
    `1fr`,
    `${minCellSize}px`,
  ].join(" ");

  return (
    <div
      className={container}
      style={assignInlineVars({
        gridTemplateColumns: templateColumns,
        gridTemplateRows: templateRows,
      })}
    >
      <PopoutButton lineType="tlbr" />
      <PopoutCols boardSize={boardSize} />
      <PopoutRows boardSize={boardSize} />
      {children}
      <PopoutButton lineType="bltr" />
    </div>
  );
}
