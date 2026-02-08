import { useAtomValue } from "jotai";
import { BOARD_SIZE, cellsAtom } from "../store/board";
import { BoardCells } from "../board/BoardCells";
import { PopupButton } from "../board/PopupButton";
import { Suspense, useDeferredValue } from "react";
import { createLineTypeNames } from "./lineTypes";

const popupButtons = createLineTypeNames(BOARD_SIZE).map((target, i) => {
  const className = [
    target === "card" ? "col-start-2 -col-end-1" : "",
    target.startsWith("row") ? "text-vertical" : "",
  ].join(" ");

  const width = target === "card" ? 900 : 360;
  const height = target === "card" ? 900 : 700;

  return (
    <PopupButton
      target={target}
      key={i}
      className={className}
      width={width}
      height={height}
    >
      {target.toUpperCase()}
    </PopupButton>
  );
});

export const MainBoard = () => {
  const cells = useAtomValue(cellsAtom);
  const deferredCells = useDeferredValue(cells);

  return (
    <div className="scrollbar-thin scrollbar-primary overflow-x-auto">
      <div
        className="grid grid-flow-dense gap-1 p-6"
        style={{
          gridTemplateColumns: `2em repeat(${BOARD_SIZE}, 8em)`,
          gridTemplateRows: `2em repeat(${BOARD_SIZE}, 8em) 2em`,
        }}
      >
        <div className="col-start-2 -col-end-1 row-start-2 -row-end-2 grid grid-cols-subgrid grid-rows-subgrid">
          <Suspense fallback={<>loading...</>}>
            <BoardCells cells={deferredCells} />
          </Suspense>
        </div>
        {popupButtons}
      </div>
    </div>
  );
};
