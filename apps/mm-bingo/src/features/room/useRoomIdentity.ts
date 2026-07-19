import { useAtomValue } from "jotai";
import { useEffect, useEffectEvent, useState } from "react";

import {
  requestRoomIdentity,
  subscribeRoomIdentity,
  type RoomIdentitySnapshot,
} from "../../libs/room/roomActionChannel";
import { roomIdentityAtom, type RoomIdentity } from "../store/room";

// A popup window has no live RoomConnection of its own (see
// roomConnectionAtom's own comment), and — once more than one live-connected
// tab exists at once — it can't trust the shared, mirrored roomIdentityAtom
// either: that atom only ever holds ONE tab's identity, whichever wrote to
// it last, regardless of which tab actually opened this particular popup
// (see roomActionChannel's own comment for the same problem on the action
// side). Every place that used to read roomIdentityAtom directly for
// anything that depends on "am I host, and which peer am I" — claim menus,
// clearing claims, "who am I" highlighting — should use this instead.
//
// A normal (non-popup) window just returns the shared atom's value, exactly
// as before: it's already correct there, protected by ignoringOtherLiveTabs
// (see room.ts) from other tabs' writes. Only a popup (window.opener set)
// switches to asking that specific opener directly and trusting only its
// answer.
export const useRoomIdentity = (): RoomIdentity | null => {
  const sharedIdentity = useAtomValue(roomIdentityAtom);
  const [popupIdentity, setPopupIdentity] = useState<RoomIdentity | null>(null);
  const isPopup = typeof window !== "undefined" && window.opener != null;

  const onPopupIdentityChange = useEffectEvent(
    (identity: RoomIdentitySnapshot) => {
      if (!isPopup) {
        return;
      }
      setPopupIdentity(identity);
    },
  );

  useEffect(() => {
    const unsubscribe = subscribeRoomIdentity(onPopupIdentityChange);
    requestRoomIdentity();
    return unsubscribe;
  }, []);

  return isPopup ? popupIdentity : sharedIdentity;
};
