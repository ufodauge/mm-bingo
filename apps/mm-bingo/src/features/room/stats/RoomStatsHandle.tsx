import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { roomStateAtom } from "../../store/room";
import { RoomStatsDrawer } from "./RoomStatsDrawer";
import { ROOM_STATS_PANEL_ID, roomStatsOpenAtom } from "./roomStatsPanelState";

export const RoomStatsHandle = () => {
  const { t } = useTranslation();
  const roomState = useAtomValue(roomStateAtom);
  const open = useAtomValue(roomStatsOpenAtom);

  if (!roomState) {
    return <></>;
  }

  return (
    <button
      popoverTarget={ROOM_STATS_PANEL_ID}
      popoverTargetAction="toggle"
      aria-label={t(open ? "room.stats.close" : "room.stats.open")}
      aria-expanded={open}
      className="btn btn-sm sticky top-26 z-20 h-16 justify-self-end rounded-r-none px-2 shadow-md"
    >
      {open ? ">" : "<"}
      <RoomStatsDrawer />
    </button>
  );
};
