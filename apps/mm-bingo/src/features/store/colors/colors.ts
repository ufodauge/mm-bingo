import { useAtomValue } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { roomConnectionAtom } from "../room";

type MarkerColorsAction =
  | {
      action: "try-add";
      value: string;
    }
  | {
      action: "try-update";
      index: number;
      value: string;
    }
  | {
      action: "try-remove";
      index: number;
    };

export const COLORS_MAX = 8;

// const defaultColorAtom = atomWithStorage(
//   "board:default-color",
//   "#422ad5",
//   undefined,
// );
// export const useDefaultMarkerColor = () => useAtomValue(defaultColorAtom);
// export const useSetDefaultMarkerColor = () => useSetAtom(defaultColorAtom);

export const markerColorsAtom = atomWithStorage(
  "ufodauge/mm-bingo/board-marker-colors",
  ["#422ad5", "#f43198", "#00d3bb"],
  undefined,
);

export const useMarkerColorsValue = () => useAtomValue(markerColorsAtom);
export const useSetMarkerColors = () =>
  useAtomCallback(
    useCallback((get, set, action: MarkerColorsAction) => {
      const current = get(markerColorsAtom);

      // A room's teams are derived 1:1 from this palette (see
      // buildTeamsFromMarkerColors/RoomSession's addTeam/removeTeamAt/
      // updateTeamColor) — pushing the same edit here, right after it's
      // written to markerColorsAtom, keeps a hosted room's teams live
      // instead of frozen at whatever the palette looked like when the
      // room was created. Guests never reach here (the marker-color editor
      // is hidden for them — see SettingsForm), and outside of a room
      // `connection` is null, so this is a no-op in both of those cases.
      // One-directional only (local edit -> room), which is only safe
      // because whatever else can make THIS window the host — a live
      // handover, or resuming hosting after a reload — resyncs this
      // palette FROM the room's actual team roster first (see
      // markerColorsFromRoomTeams in features/room/roomActions.ts):
      // without that, a promoted host's local palette here could disagree
      // with roomState.teams and this push would silently edit the wrong
      // team by index.
      const connection = get(roomConnectionAtom);

      if (action.action === "try-add") {
        if (current.length < COLORS_MAX) {
          set(markerColorsAtom, [...current, action.value]);
          if (connection?.role === "host") {
            connection.session.addTeam(action.value);
          }
          return true;
        }
        return false;
      } else if (action.action === "try-remove") {
        if (0 <= action.index && action.index < current.length) {
          set(markerColorsAtom, current.toSpliced(action.index, 1));
          if (connection?.role === "host") {
            connection.session.removeTeamAt(action.index);
          }
          return true;
        }
        return false;
      } else if (action.action === "try-update") {
        if (0 <= action.index && action.index < current.length) {
          set(
            markerColorsAtom,
            current.toSpliced(action.index, 1, action.value),
          );
          if (connection?.role === "host") {
            connection.session.updateTeamColor(action.index, action.value);
          }
          return true;
        }
        return false;
      }
    }, []),
  );
