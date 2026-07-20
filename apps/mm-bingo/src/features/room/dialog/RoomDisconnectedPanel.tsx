import { useTranslation } from "react-i18next";

type Props = {
  onReconnect: () => void;
  onLeave: () => void;
};

// Shown when a live session always clears both `connection` and
// `roomState` together on its way out (see RoomDialog's returnToSoloMode)
// — so landing here means there's no session left to do that: only this
// window's own RoomSession object died (a reload or a crash), which says
// nothing about whether the room itself is still going for everyone else
// (a surviving peer would already have taken over as host — see
// RoomSession's peer-leave handling). Offers to rejoin first, with giving
// up as the fallback, instead of silently leaving the board locked with no
// visible room UI to explain why (see useCellInteraction: any non-null
// roomState locks the board regardless of whether a connection is
// actually alive).
export const RoomDisconnectedPanel = ({ onReconnect, onLeave }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-2">
      <h3 className="text-2xl font-bold">{t("room.title")}</h3>
      <div className="grid gap-2 px-4">
        <p className="text-sm">{t("room.disconnected")}</p>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={onReconnect}>
            {t("room.reconnect")}
          </button>
          <button className="btn btn-sm btn-error" onClick={onLeave}>
            {t("room.leave")}
          </button>
        </div>
      </div>
    </div>
  );
};
