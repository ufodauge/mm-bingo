import { useTranslation } from "react-i18next";

import type { RoomState } from "../../../libs/room/types";
import type { RoomConnection } from "../../store/room";
import { RoomInviteSection } from "./RoomInviteSection";
import { RoomModeSection } from "./RoomModeSection";
import { RoomPlayersList } from "./RoomPlayersList";

type Props = {
  connection: RoomConnection;
  roomState: RoomState;
  displayName: string;
  onRenameSelf: (name: string) => void;
  onLeave: () => void;
};

export const RoomConnectedPanel = ({
  connection,
  roomState,
  displayName,
  onRenameSelf,
  onLeave,
}: Props) => {
  const { t } = useTranslation();
  const isHost = connection.role === "host";

  return (
    <div className="grid gap-2">
      <h3 className="flex items-center gap-2 text-2xl font-bold">
        {t("room.title")}
        <span
          data-testid="room-role-badge"
          className={`badge badge-sm ${isHost ? "badge-warning" : "badge-ghost"}`}
        >
          {isHost ? t("room.role.host") : t("room.role.guest")}
        </span>
      </h3>
      <div className="grid gap-2 px-4">
        <label className="fieldset-label">{t("room.yourName")}</label>
        <input
          className="input input-sm"
          placeholder={t("room.namePlaceholder")}
          value={displayName}
          onChange={(e) => onRenameSelf(e.currentTarget.value)}
        />
        <RoomPlayersList connection={connection} roomState={roomState} />
        {isHost && (
          <RoomModeSection connection={connection} roomState={roomState} />
        )}
        {isHost && <RoomInviteSection roomId={connection.session.roomId} />}
        <button className="btn btn-sm btn-error" onClick={onLeave}>
          {t("room.leave")}
        </button>
      </div>
    </div>
  );
};
