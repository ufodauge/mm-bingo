import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { useRoomIdentity } from "../features/room/useRoomIdentity";
import { RoomStatsPanel } from "../features/room/stats/RoomStatsPanel";
import { roomStateAtom } from "../features/store/room";

// A popped-out window never holds a live RoomSession (see roomConnectionAtom's
// own comment), only the same persisted roomStateAtom every other window
// shares via the `storage` event — exactly what RoomStatsPanel already
// needs, so this page is just that panel plus the "no room" / "room ended"
// states it can't render itself. `identity` comes from useRoomIdentity, not
// roomIdentityAtom directly, since that shared atom can't tell "my opener's
// identity" from "some other live tab's" once more than one is live at once
// (see that hook's own comment) — this popup's own opener is the only one
// that matters for "am I looking at myself" highlighting below.
export const RoomStatsPopup = () => {
  const { t } = useTranslation();
  const roomState = useAtomValue(roomStateAtom);
  const identity = useRoomIdentity();

  if (!roomState) {
    return (
      <div className="grid place-items-center p-4 text-sm opacity-70">
        {t("room.disconnected")}
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4">
      <h3 className="text-lg font-bold">{t("room.stats.title")}</h3>
      <RoomStatsPanel
        roomState={roomState}
        myPeerId={identity?.peerId ?? null}
      />
    </div>
  );
};
