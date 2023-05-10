import React from "react";

import { useTaskData } from "@/lib/hooks/useTaskData";
import { LineType } from "@/types/lineType";
import { Global, css } from "@emotion/react";

import PopoutButton from "./buttons/popoutButton";
import PopoutCols from "./parts/popoutCols";
import PopoutRows from "./parts/popoutRows";
import TaskBoard from "./parts/taskBoard";

export default function BingoBoard() {
  const taskData = useTaskData();

  const lines: LineType[] = ["bltr", "card", "tlbr"];
  for (let i = 0; i < taskData.size; i++) {
    lines.push(`col${i + 1}`, `row${i + 1}`);
  }

  const minCellSize = 60;
  const normalCellSize = 120;
  const gapPx = 2;
  const boardSize = taskData.size;

  const style = css({
    display: "grid",
    gridTemplateColumns: `
            ${minCellSize}px 
            ${normalCellSize * boardSize}px`,
    gridTemplateRows: `
            ${minCellSize}px 
            ${normalCellSize * boardSize}px
            ${minCellSize}px`,
    gap: `${gapPx}px`,
    margin: "1em",
  });

  const globalStyle = css({
    body: {
      minWidth:
        (taskData.size + 1) * normalCellSize +
        minCellSize +
        gapPx * taskData.size,
    },
  });

  return (
    <div css={style}>
      <Global styles={globalStyle} />

      <PopoutButton lineType="tlbr" />
      <PopoutCols boardSize={boardSize} gap={gapPx} />
      <PopoutRows boardSize={boardSize} gap={gapPx} />
      <TaskBoard boardSize={boardSize} gap={gapPx} />
      <PopoutButton lineType="bltr" />
      <PopoutButton lineType="card" />
    </div>
  );
}
