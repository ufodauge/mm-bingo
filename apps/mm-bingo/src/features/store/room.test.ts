import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import type { RoomState } from "../../libs/room/types";
import { CELLS_COUNT } from "./board";
import {
  roomConnectionAtom,
  roomPhaseAtom,
  roomStateAtom,
  type RoomConnection,
} from "./room";
import { latestTaskVersion } from "./versions/taskVersion";

const makeRoomState = (): RoomState => ({
  roomId: "room",
  mode: "classic",
  hostId: "host",
  epoch: 0,
  teams: [],
  players: [],
  cellClaims: Array.from({ length: CELLS_COUNT }, () => []),
  cellMemos: Array.from({ length: CELLS_COUNT }, () => ({})),
  claimSharing: "exclusive",
  revealedCells: "all",
  boardRevealed: true,
  endsRoomOnReveal: false,
  seed: 1,
  taskVersion: latestTaskVersion,
});

// A real RoomSession isn't needed here — roomPhaseAtom only ever checks
// whether roomConnectionAtom holds *something*, never what's inside it.
// `session.peerId` still has to exist, though: roomConnectionAtom's own
// setter (see room.ts) reads it to keep roomIdentityAtom in sync on every
// write, real RoomSession or not.
const fakeConnection = {
  role: "host",
  session: { peerId: "peer-1" },
} as RoomConnection;

describe("roomPhaseAtom", () => {
  it("is 'none' when neither a connection nor room state exists", () => {
    const store = createStore();

    expect(store.get(roomPhaseAtom)).toEqual({ kind: "none" });
  });

  it("is 'connecting' with a live connection but no state yet", () => {
    const store = createStore();
    store.set(roomConnectionAtom, fakeConnection);

    expect(store.get(roomPhaseAtom)).toEqual({
      kind: "connecting",
      connection: fakeConnection,
    });
  });

  it("is 'connected' once both a connection and room state exist", () => {
    const store = createStore();
    const state = makeRoomState();
    store.set(roomConnectionAtom, fakeConnection);
    store.set(roomStateAtom, state);

    expect(store.get(roomPhaseAtom)).toEqual({
      kind: "connected",
      connection: fakeConnection,
      roomState: state,
    });
  });

  it("is 'orphaned' when room state outlived its connection", () => {
    const store = createStore();
    const state = makeRoomState();
    store.set(roomStateAtom, state);

    expect(store.get(roomPhaseAtom)).toEqual({
      kind: "orphaned",
      roomState: state,
    });
  });
});
