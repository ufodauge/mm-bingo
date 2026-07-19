import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { queryParamsAtom } from "./queryParams";
import {
  pushBoardSettingsIfHosting,
  roomConnectionAtom,
  roomStateAtom,
} from "./room";

const boundSeedNumber = (value: number) =>
  Number.isFinite(value) ? Math.max(value, 0) : 0;

export const getRandomSeedNumber = () =>
  boundSeedNumber(Math.trunc(Math.random() * 1000000));

// A room's seed is fully determined by `RoomState`, broadcast over WebRTC.
// The host is the source of truth: its local edits write through to
// `queryParamsAtom` and are pushed to the session right here in the same
// write, so every other peer (guests, popups, a reloaded host window with
// no live connection) can just read the room's value directly instead of
// copying it into a separate piece of state.
export const seedNumberAtom = atom(
  (get) => {
    const roomState = get(roomStateAtom);
    const connection = get(roomConnectionAtom);
    if (roomState && connection?.role !== "host") {
      return roomState.seed;
    }
    return get(queryParamsAtom).seed;
  },
  (get, set, seed: number) => {
    const status = structuredClone(get(queryParamsAtom));
    status.seed = seed;
    set(queryParamsAtom, status);
    pushBoardSettingsIfHosting(get);
  },
);

export const useSeedNumberValue = () => useAtomValue(seedNumberAtom);
type SeedNumberAction =
  | {
      action: "randomize";
    }
  | {
      action: "set";
      value: number;
    };

export const useSeedNumberReducer = () =>
  useAtomCallback(
    useCallback((_, set, action: SeedNumberAction) => {
      if (action.action === "randomize") {
        set(seedNumberAtom, getRandomSeedNumber());
      } else if (action.action === "set") {
        set(seedNumberAtom, boundSeedNumber(action.value));
      }
    }, []),
  );
