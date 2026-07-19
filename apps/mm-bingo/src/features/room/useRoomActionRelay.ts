import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useEffectEvent, useRef } from "react";

import {
  replyRoomIdentity,
  subscribeRoomActions,
  subscribeRoomIdentityRequests,
  type RoomAction,
} from "../../libs/room/roomActionChannel";
import { roomConnectionAtom, roomIdentityAtom } from "../store/room";

// The other end of roomActionChannel: mount this once in whichever window
// actually holds the RoomSession (see MainBoard — popup windows never do,
// see roomConnectionAtom's comment) so a claim requested from a popup is
// applied here exactly as a local click would be. The resulting RoomState
// change then reaches every window the normal way, through roomStateAtom.
//
// Also the other end of the identity request/reply pair (see
// roomActionChannel's own comment) — replies to any popup asking "what's my
// identity" and remembers it in `knownPopups` (a ref, so it survives this
// effect re-running on every identity change) so a later role change (e.g.
// a host handover) can be pushed to every popup that's ever asked, not just
// answered once at open time.
//
// Also clears roomIdentityAtom on unload: it's what lets a popup tell "an
// orphaned room nobody can act on" apart from "a room someone is actually
// connected to" (see roomCellInteraction's canAct), and unlike
// roomConnectionAtom it's persisted — so without this, a reload or closed
// tab would leave popups thinking a now-dead connection is still there to
// relay to.
export const useRoomActionRelay = (): void => {
  const connection = useAtomValue(roomConnectionAtom);
  const identity = useAtomValue(roomIdentityAtom);
  const setIdentity = useSetAtom(roomIdentityAtom);
  const knownPopups = useRef<Set<MessageEventSource>>(new Set());

  const clearIdentityOnUnload = useEffectEvent(() => setIdentity(null));
  const onRoomIdentityChange = useEffectEvent(
    (respondTo: MessageEventSource) => {
      knownPopups.current.add(respondTo);
      replyRoomIdentity(respondTo, identity);
    },
  );
  const onRoomIdentityRequest = useEffectEvent((action: RoomAction) => {
    if (!connection) {
      return;
    }

    switch (action.type) {
      case "claim-cell": {
        connection.session.claimCell(action.cellIndex);
        return;
      }
      case "unclaim-cell": {
        connection.session.unclaimCell(action.cellIndex);
        return;
      }
      case "set-team-claim": {
        connection.session.setTeamClaim(
          action.cellIndex,
          action.teamId,
          action.claimed,
        );
        return;
      }
      case "clear-cell-claims": {
        connection.session.clearCellClaims(action.cellIndex);
        return;
      }
      case "set-my-memo": {
        connection.session.setMyMemo(action.cellIndex, action.emoji);
        return;
      }
      case "set-team-memo": {
        connection.session.setTeamMemo(
          action.cellIndex,
          action.teamId,
          action.emoji,
        );
        return;
      }
    }
  });

  useEffect(() => {
    if (!connection) {
      return;
    }

    for (const popup of knownPopups.current) {
      replyRoomIdentity(popup, identity);
    }

    window.addEventListener("pagehide", clearIdentityOnUnload);

    const unsubscribeIdentityRequests =
      subscribeRoomIdentityRequests(onRoomIdentityChange);
    const unsubscribe = subscribeRoomActions(onRoomIdentityRequest);

    return () => {
      window.removeEventListener("pagehide", clearIdentityOnUnload);
      unsubscribeIdentityRequests();
      unsubscribe();
    };
  }, [connection, identity]);
};
