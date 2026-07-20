import { useTranslation } from "react-i18next";

import type { RoomState } from "../../../libs/room/types";
import type { RoomConnection } from "../../store/room";

type Props = {
  connection: RoomConnection;
  roomState: RoomState;
};

export const RoomPlayersList = ({ connection, roomState }: Props) => {
  const { t } = useTranslation();

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
      <legend className="fieldset-legend">{t("room.players.title")}</legend>
      <ul
        className="grid grid-cols-[auto_1fr] gap-1 px-2"
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
          </li>
        ))}
      </ul>
    </fieldset>
  );
};
