import { useAtomValue } from "jotai";
import { Suspense, useDeferredValue } from "react";

import { IconRemoveSelection } from "../../libs/icons/RemoveSelection";
import { BoardCells } from "../board/BoardCells";
import { PopupButton } from "../board/PopupButton";
import { RoomDisconnectedBanner } from "../room/RoomDisconnectedBanner";
import { useClearRoomClaims } from "../room/useClearRoomClaims";
import { useRoomActionRelay } from "../room/useRoomActionRelay";
import { BOARD_SIZE, cellsAtom, type Cell } from "../store/board";
import { useSetColorIndices } from "../store/colors/indices";
import { roomPhaseAtom, roomStateAtom } from "../store/room";
import { createLineTypeNames } from "./lineTypes";
import { EmptyTaskWarning } from "./warnings/EmptyTaskWarning";
import { FallbackTaskWarning } from "./warnings/FallbackTaskWarning";

const lineTypes = createLineTypeNames(BOARD_SIZE);

export const MainBoard = () => {
  useRoomActionRelay();
  const cells = useAtomValue(cellsAtom);
  const deferredCells = useDeferredValue(cells);
  const hasEmptyTasks = deferredCells?.some((cell) => cell.isEmpty) ?? false;
  const hasFallbackTasks =
    deferredCells?.some((cell) => cell.isFallback) ?? false;
  const roomState = useAtomValue(roomStateAtom);
  const roomPhase = useAtomValue(roomPhaseAtom);
  const clearRoomClaims = useClearRoomClaims();
  const setColor = useSetColorIndices();
  // Whole-board equivalent of PopupBoard's per-row/column clear button —
  // same "un-claim only my own team's cells, or clear my own solo markings
  // outside a room" behavior (see useClearRoomClaims), just scoped to every
  // cell instead of one line.
  const clearMyWholeBoard = (allCells: Cell[] | undefined) => {
    if (roomState) {
      clearRoomClaims(allCells?.map((c) => c.index) ?? []);
      return;
    }
    setColor({ action: "clear" });
  };

  const popupButtons = lineTypes.map((target, i) => {
    const className = [
      target === "card" ? "col-start-2 -col-end-1" : "",
      target.startsWith("row") ? "text-vertical" : "",
    ].join(" ");

    const width = target === "card" ? 900 : 360;
    const height = target === "card" ? 900 : 700;

    if (target !== "card") {
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
    }

    return (
      <PopupButton
        target={target}
        key={i}
        className={`${className} grid grid-cols-3`}
        width={width}
        height={height}
      >
        <span className="col-start-2">{target.toUpperCase()}</span>
        <div className="col-start-3 grid justify-end">
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={(e) => {
              // The whole button is otherwise a single big click target for
              // opening the popup (see PopupButton) — this one small area
              // needs to opt back out of that.
              e.stopPropagation();
              clearMyWholeBoard(deferredCells);
            }}
          >
            <span className="size-4 fill-current">
              <IconRemoveSelection />
            </span>
          </button>
        </div>
      </PopupButton>
    );
  });
  // roomStateAtom outliving roomConnectionAtom means there's no live session
  // left to explain why the board is locked (see roomPhaseAtom's "orphaned"
  // case, and RoomDialog which shows the same phase as RoomDisconnectedPanel)
  // — surfacing that takes priority over the task-data warnings below, since
  // it's the reason nothing on the board responds at all.
  const isRoomOrphaned = roomPhase.kind === "orphaned";

  return (
    <div className="scrollbar-primary scrollbar-thin overflow-x-auto">
      {isRoomOrphaned && <RoomDisconnectedBanner />}
      {!isRoomOrphaned && hasEmptyTasks && <EmptyTaskWarning />}
      {!isRoomOrphaned && !hasEmptyTasks && hasFallbackTasks && (
        <FallbackTaskWarning />
      )}
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
