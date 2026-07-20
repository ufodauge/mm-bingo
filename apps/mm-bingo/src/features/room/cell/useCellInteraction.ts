import { useAtomValue } from "jotai";
import { useState, type MouseEvent } from "react";

import type { Team } from "../../../libs/room/types";
import type { Cell } from "../../store/board";
import { useMarkerColorsValue } from "../../store/colors/colors";
import {
  useColorIndices,
  useSetColorIndices,
} from "../../store/colors/indices";
import { roomConnectionAtom, roomStateAtom } from "../../store/room";
import { useRoomIdentity } from "../useRoomIdentity";
import { computeRoomCellInteraction } from "./roomCellInteraction";

// One row per team in the claim menu. `onToggle` is null when this
// particular viewer can't act on this particular team's row right now
// (e.g. a guest looking at another team's row, or an othello cell that no
// longer supports un-claiming) — the menu renders it disabled rather than
// omitting it, so the reason (a title/tooltip) stays visible.
export type CellClaimMenuRow = {
  team: Team;
  claimed: boolean;
  onToggle: (() => void) | undefined;
};

export type CellMemoRow = {
  team: Team;
  value: string | undefined;
  onChange: (emoji: string | undefined) => void;
};

export type CellClaimMenu = {
  rows: CellClaimMenuRow[];
  onClearAll: (() => void) | undefined;
  memoRows: CellMemoRow[];
  onClose: () => void;
};

export type CellInteraction = {
  activeColor: string;
  locked: boolean;
  textVisible: boolean;
  // Other teams' claims on this same cell, besides whichever one is used
  // for activeColor — rendered as small badges (see CellOverlays).
  otherClaimants: Team[];
  // MY OWN team's memo emoji for this cell, if any (top-right badge).
  memo: string | undefined;
  onClick: () => void;
  onContextMenu: (e: MouseEvent) => void;
  claimMenu: CellClaimMenu | undefined;
};

// Every hook this reads is unconditional regardless of which branch below
// actually needs it (rules of hooks — a custom hook can't call one set of
// hooks only when in a room and another only outside one, since that set
// can change from one render to the next as rooms start/end). Only the
// *computation* branches; see computeRoomCellInteraction for the "inside a
// room" half.
export const useCellInteraction = (cell: Cell): CellInteraction => {
  const roomState = useAtomValue(roomStateAtom);
  const connection = useAtomValue(roomConnectionAtom);
  const identity = useRoomIdentity();
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const setColorIndices = useSetColorIndices();
  const [menuOpen, setMenuOpen] = useState(false);

  if (roomState) {
    return computeRoomCellInteraction({
      cell,
      roomState,
      connection,
      identity,
      menuOpen,
      setMenuOpen,
    });
  }

  const colorIndex = colorIndices.at(cell.index);
  const activeColor =
    colorIndex === 0
      ? "var(--color-base-100)"
      : colorIndex
        ? (colors.at(colorIndex - 1) ?? "transparent")
        : "transparent";

  return {
    activeColor,
    locked: false,
    textVisible: true,
    otherClaimants: [],
    memo: undefined,
    onClick: () =>
      setColorIndices({ action: "set-at", index: cell.index, to: "next" }),
    onContextMenu: (e) => {
      e.preventDefault();
      setColorIndices({ action: "set-at", index: cell.index, to: "prev" });
    },
    claimMenu: undefined,
  };
};
