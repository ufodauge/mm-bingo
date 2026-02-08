import { memo } from "react";
import { type Cell } from "../store/board";
import { BoardColoredCell } from "./BoardColoredCell";

type Props = {
  cells: Cell[] | undefined;
};

export const BoardCells = memo(function MainBoard({ cells }: Props) {
  return (
    <>
      {cells?.map((cell, i) => {
        const { width, height } = cell.rect;
        const className =
          width === height && height === 1
            ? "col-span-1 row-span-1"
            : undefined;
        return (
          <div
            key={i}
            className={className}
            style={
              className === undefined
                ? {
                    gridColumn: `span ${width} / span ${width}`,
                    gridRow: `span ${height} / span ${height}`,
                  }
                : {}
            }
          >
            <BoardColoredCell
              cell={cell}
              key={`cell-${i}`}
              className="place-self-stretch p-2"
            />
          </div>
        );
      })}
    </>
  );
});
