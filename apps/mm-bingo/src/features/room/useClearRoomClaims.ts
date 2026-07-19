import { useAtomValue } from "jotai";

import { postRoomAction } from "../../libs/room/roomActionChannel";
import { roomConnectionAtom, roomStateAtom } from "../store/room";
import { useRoomIdentity } from "./useRoomIdentity";

// The popup board's per-row/column "clear" button (see PopupBoard.tsx) was
// always calling the solo-mode colorIndices clear, which does nothing
// visible while a room is active — cell color there comes from
// `roomState.cellClaims`, not `colorIndicesAtom`. Reinterpreted for a room:
// wiping every team's progress would be a far more destructive action than
// the solo "clear my own markings" button it replaces, so this only ever
// un-claims the caller's OWN team's claims among the given cells — each
// mode's supportsUnclaim rules still apply (see withUnclaimAttempt), so it
// silently no-ops wherever un-claiming isn't allowed (e.g. othello).
export const useClearRoomClaims = (): ((cellIndices: number[]) => void) => {
  const roomState = useAtomValue(roomStateAtom);
  const connection = useAtomValue(roomConnectionAtom);
  const identity = useRoomIdentity();

  return (cellIndices: number[]) => {
    if (!roomState || !identity) {
      return;
    }
    const myTeamId = roomState.players.find(
      (p) => p.peerId === identity.peerId,
    )?.teamId;
    if (!myTeamId) {
      return;
    }
    for (const cellIndex of cellIndices) {
      if (!roomState.cellClaims[cellIndex].includes(myTeamId)) {
        continue;
      }
      if (connection) {
        connection.session.unclaimCell(cellIndex);
      } else {
        postRoomAction({ type: "unclaim-cell", cellIndex });
      }
    }
  };
};
