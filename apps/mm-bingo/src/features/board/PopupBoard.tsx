import { useAtomValue } from "jotai";
import { Suspense, useDeferredValue } from "react";

import { IconRemoveSelection } from "../../libs/icons/RemoveSelection";
import { PopupButton } from "../board/PopupButton";
import { useClearRoomClaims } from "../room/useClearRoomClaims";
import { BOARD_SIZE, cellsAtom } from "../store/board";
import { useSetColorIndices } from "../store/colors/indices";
import { roomStateAtom } from "../store/room";
import { BoardCells } from "./BoardCells";
import { BoardColumn } from "./BoardColumn";
import { createLineTypeNames, type LineType } from "./lineTypes";

const popupButtons = createLineTypeNames(BOARD_SIZE)
  .filter((v) => v !== "card")
  .map((target, i) => {
    const className = target.startsWith("row") ? "text-vertical" : "";

    const width = 450;
    const height = 900;

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

type Props = {
  target: LineType;
};

export const PopupBoard = ({ target }: Props) => {
  const cells = useDeferredValue(useAtomValue(cellsAtom));
  const setColor = useSetColorIndices();
  const roomState = useAtomValue(roomStateAtom);
  const clearRoomClaims = useClearRoomClaims();

  if (target === "card") {
    return (
      <div
        className="grid h-svh w-svw grid-flow-dense gap-1"
        style={{
          gridTemplateColumns: `2em repeat(${BOARD_SIZE}, minmax(100px, 7fr))`,
          gridTemplateRows: `2em repeat(${BOARD_SIZE}, minmax(100px, 7fr)) 2em`,
        }}
      >
        <div className="col-start-2 -col-end-1 row-start-2 -row-end-2 grid grid-cols-subgrid grid-rows-subgrid">
          <Suspense
            fallback={<div className="loading col-span-full row-span-full" />}
          >
            <BoardCells cells={cells} />
          </Suspense>
        </div>
        {popupButtons}
      </div>
    );
  }

  const targetCells = cells?.filter((v) => v.lineTypes.includes(target));

  return (
    <div
      className="grid h-svh w-svw grid-flow-dense gap-1"
      style={{
        gridTemplateRows: `2em repeat(${BOARD_SIZE}, minmax(100px, 7fr))`,
      }}
    >
      <PopupButton
        target={target}
        clickable={false}
        className="grid grid-cols-3"
      >
        <span className="col-start-2">{target.toUpperCase()}</span>
        <div className="col-start-3 grid justify-end">
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() =>
              roomState
                ? clearRoomClaims(targetCells?.map((c) => c.index) ?? [])
                : setColor({ action: "clear" })
            }
          >
            <span className="size-4 fill-current">
              <IconRemoveSelection />
            </span>
          </button>
        </div>
      </PopupButton>
      <Suspense
        fallback={<div className="loading col-span-full row-span-full" />}
      >
        <BoardColumn cells={targetCells} />
      </Suspense>
    </div>
  );
};
