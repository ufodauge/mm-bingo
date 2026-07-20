import { useTranslation } from "react-i18next";

import {
  effectiveClaimSharing,
  type PeerId,
  type RoomState,
} from "../../../libs/room/types";
import { findSimpleModePreset } from "../dialog/roomModePresets";

type Props = {
  roomState: RoomState;
  // null outside a room-aware window (e.g. this panel rendered in a popup
  // that never received an identity of its own) — every player row still
  // renders, just without a "you" badge on any of them.
  myPeerId: PeerId | null;
};

// Read-only: shows what's actually happening in the room (mode, who's
// here, which team) without offering to change any of it — editing stays
// exclusively in the room dialog (RoomModeSection/RoomPlayersList), which
// already has the reset confirmation and host-only gating that changing
// these values needs. Shared verbatim between RoomStatsDrawer (the live
// window) and RoomStatsPopupPage (a popped-out window, which never holds a
// RoomSession) — both just need roomState/identity, not a live connection.
export const RoomStatsPanel = ({ roomState, myPeerId }: Props) => {
  const { t } = useTranslation();
  const claimSharing = effectiveClaimSharing(roomState);
  const preset = findSimpleModePreset(roomState.mode, claimSharing);
  const modeLabel = preset
    ? t(preset.labelKey)
    : // A combination no simple preset names (only reachable via the
      // advanced picker) — spell out both axes instead of guessing.
      `${t(`room.mode.${roomState.mode}`)} / ${t(`room.claimSharing.${claimSharing}`)}`;

  return (
    <div className="grid gap-3">
      <div>
        <h4 className="text-xs font-bold opacity-70">{t("room.mode.title")}</h4>
        <p className="text-sm">{modeLabel}</p>
      </div>
      <div>
        <h4 className="text-xs font-bold opacity-70">
          {t("room.players.title")}
        </h4>
        <ul className="grid gap-1">
          {roomState.players.map((player) => {
            const team = roomState.teams.find((t) => t.id === player.teamId);
            return (
              <li
                key={player.peerId}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: team?.color ?? "transparent" }}
                />
                <span className="flex-1 truncate">
                  {player.name}
                  {player.peerId === myPeerId
                    ? ` (${t("room.players.you")})`
                    : ""}
                  {player.peerId === roomState.hostId
                    ? ` (${t("room.players.host")})`
                    : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
