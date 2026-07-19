import { memo } from "react";

import { type Cell } from "../store/board";
import { BoardColoredCell } from "./cell/BoardColoredCell";

type Props = {
  cells: Cell[] | undefined;
};

export const BoardColumn = memo(function BoardColumn({ cells }: Props) {
  return (
    <>
      {cells?.map((cell, i) => {
        return (
          <div key={i}>
            <BoardColoredCell
              cell={cell}
              key={`cell-${i}`}
              className="grid size-full auto-rows-auto"
              showTrackers
            />
          </div>
        );
      })}
    </>
  );
});
