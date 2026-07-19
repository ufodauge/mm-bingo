import { atom } from "jotai";

import { queryParamsAtom } from "./queryParams";
import {
  pushBoardSettingsIfHosting,
  roomConnectionAtom,
  roomStateAtom,
} from "./room";
import type { TaskVersion } from "./versions/taskVersion";

// See seedNumberAtom for why non-host peers read straight from RoomState,
// and why the host's write function pushes to the room itself rather than
// an effect watching for the value to have changed.
export const taskVersionAtom = atom(
  (get) => {
    const roomState = get(roomStateAtom);
    const connection = get(roomConnectionAtom);
    if (roomState && connection?.role !== "host") {
      return roomState.taskVersion;
    }
    return get(queryParamsAtom).version;
  },
  (get, set, version: TaskVersion) => {
    const status = structuredClone(get(queryParamsAtom));
    status.version = version;
    set(queryParamsAtom, status);
    pushBoardSettingsIfHosting(get);
  },
);
