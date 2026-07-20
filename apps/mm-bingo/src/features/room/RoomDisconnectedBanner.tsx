import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";

import { leaveOrphanedRoomAtom, reconnectToRoomAtom } from "./roomActions";

// Rendered unconditionally by MainBoard, gated on the same "orphaned room"
// check RoomDialog's own escape-hatch branch uses — but as a banner rather
// than something buried behind opening the Room dialog, since the board
// underneath is locked and otherwise gives no clue why.
export const RoomDisconnectedBanner = () => {
  const { t } = useTranslation();
  const reconnectToRoom = useSetAtom(reconnectToRoomAtom);
  const leaveOrphanedRoom = useSetAtom(leaveOrphanedRoomAtom);

  return (
    <div className="alert alert-warning">
      <span>{t("room.disconnected")}</span>
      <div className="flex gap-2">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => reconnectToRoom()}
        >
          {t("room.reconnect")}
        </button>
        <button className="btn btn-sm btn-error" onClick={leaveOrphanedRoom}>
          {t("room.leave")}
        </button>
      </div>
    </div>
  );
};
