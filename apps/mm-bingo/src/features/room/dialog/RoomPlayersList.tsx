import { useTranslation } from "react-i18next";

import { createRandomColor } from "../../../libs/color";
import { IconAdd } from "../../../libs/icons/Add";
import { IconDelete } from "../../../libs/icons/Delete";
import type { RoomState } from "../../../libs/room/types";
import {
  COLORS_MAX,
  useMarkerColorsValue,
  useSetMarkerColors,
} from "../../store/colors/colors";
import type { RoomConnection } from "../../store/room";

type Props = {
  connection: RoomConnection;
  roomState: RoomState;
};

export const RoomPlayersList = ({ connection, roomState }: Props) => {
  const { t } = useTranslation();
  const markerColors = useMarkerColorsValue();
  const setMarkerColors = useSetMarkerColors();
  const isHost = connection.role === "host";

  const setTeamColor = (index: number, color: string) => {
    setMarkerColors({ action: "try-update", index, value: color });
  };
  const addTeam = () => {
    setMarkerColors({ action: "try-add", value: createRandomColor() });
  };
  const removeTeam = () => {
    setMarkerColors({ action: "try-remove", index: markerColors.length - 1 });
  };

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
      <legend className="fieldset-legend">{t("room.players.title")}</legend>
      {isHost && (
        <div className="mb-2 flex flex-wrap items-center gap-2 px-2">
          <span className="text-sm font-bold">
            {t("room.players.teamCount")}
          </span>
          <div className="flex items-center gap-1">
            {roomState.teams.map((team, i) => (
              <input
                type="color"
                className="reset-input-color size-6 rounded-full border-2 border-neutral-300"
                value={team.color}
                onChange={(e) => setTeamColor(i, e.target.value)}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn btn-xs btn-circle"
            aria-label={t("room.players.removeTeam")}
            onClick={removeTeam}
            disabled={markerColors.length <= 1}
          >
            <span className="size-3 fill-current">
              <IconDelete />
            </span>
          </button>
          <button
            type="button"
            className="btn btn-xs btn-circle btn-primary"
            aria-label={t("room.players.addTeam")}
            onClick={addTeam}
            disabled={markerColors.length >= COLORS_MAX}
          >
            <span className="size-3 fill-current">
              <IconAdd />
            </span>
          </button>
          <button
            type="button"
            className="btn btn-xs"
            onClick={() => connection.session.randomizeTeams()}
          >
            {t("room.players.randomizeTeams")}
          </button>
        </div>
      )}
      <ul
        className="grid grid-cols-[auto_1fr_auto] gap-1 px-2"
        data-testid="room-players-list"
      >
        {roomState.players.map((player) => (
          <li
            key={player.peerId}
            data-testid={`room-player-${player.peerId}`}
            className="col-span-full grid grid-cols-subgrid items-center gap-2"
          >
            <span
              className={`grid grid-flow-col gap-2 ${player.peerId === connection.session.peerId && "font-bold"}`}
            >
              {player.name}
              <span
                data-testid="room-player-role-badge"
                className={`badge badge-sm ${player.peerId === roomState.hostId && "badge-warning"}`}
              >
                {player.peerId === roomState.hostId && t("room.role.host")}
              </span>
            </span>
            {connection.role === "host" ? (
              <select
                className="select select-sm"
                value={player.teamId ?? ""}
                onChange={(e) =>
                  connection.session.setPlayerTeam(
                    player.peerId,
                    e.currentTarget.value || null,
                  )
                }
              >
                <option value="">{t("room.players.noTeam")}</option>
                {roomState.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className="size-4 rounded-full"
                style={{
                  backgroundColor:
                    roomState.teams.find((t) => t.id === player.teamId)
                      ?.color ?? "transparent",
                }}
              />
            )}
            {isHost && player.peerId !== connection.session.peerId ? (
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => connection.session.transferHostTo(player.peerId)}
              >
                {t("room.players.makeHost")}
              </button>
            ) : (
              <span />
            )}
          </li>
        ))}
      </ul>
    </fieldset>
  );
};
