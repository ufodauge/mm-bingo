import React, { memo } from 'react';

import { useTaskData } from '@/lib/hooks/useTaskData';
import { LineType } from '@/types/lineType';
import { assignInlineVars } from '@vanilla-extract/dynamic';

import PopoutButton from './buttons/popoutButton';
import { container, minCellSize, normalCellSize } from './index.css';
import PopoutCols from './parts/popoutCols';
import PopoutRows from './parts/popoutRows';
import TaskBoard from './parts/taskBoard';

const BingoBoard = memo(function BingoBoard() {
  const taskData = useTaskData();

  const lines: LineType[] = ["bltr", "card", "tlbr"];
  for (let i = 0; i < taskData.size; i++) {
    lines.push(`col${i + 1}`, `row${i + 1}`);
  }

  const boardSize       = taskData.size;
  const templateColumns = `${minCellSize}px ${normalCellSize * boardSize}px`;
  const templateRows    = [
    `${minCellSize}px`,
    `${normalCellSize * boardSize}px`,
    `${minCellSize}px`,
  ].join(" ");

  return (
    <div
      className={container}
      style={assignInlineVars({
        gridTemplateColumns: templateColumns,
        gridTemplateRows   : templateRows,
      })}
    >
      <PopoutButton lineType  = "tlbr" />
      <PopoutCols   boardSize = {boardSize} />
      <PopoutRows   boardSize = {boardSize} />
      <TaskBoard    boardSize = {boardSize} />
      <PopoutButton lineType  = "bltr" />
      <PopoutButton lineType  = "card" />
    </div>
  );
});

export default BingoBoard;
