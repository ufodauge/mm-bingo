import { describe, expect, it } from "vitest";

import type { RoomState } from "../../libs/room/types";
import { CELLS_COUNT } from "../store/board";
import { latestTaskVersion } from "../store/versions/taskVersion";
import { bakeRoomClaimsToColorIndices } from "./bakeRoomClaims";

const makeState = (cellClaims: Record<number, string[]>): RoomState => ({
  roomId: "room",
  mode: "classic",
  hostId: "host",
  epoch: 0,
  teams: [
    { id: "team-0", color: "#111111", name: "Team 1" },
    { id: "team-1", color: "#222222", name: "Team 2" },
  ],
  players: [],
  cellClaims: Array.from(
    { length: CELLS_COUNT },
    (_, i) => cellClaims[i] ?? [],
  ),
  cellMemos: Array.from({ length: CELLS_COUNT }, () => ({})),
  claimSharing: "shared",
  revealedCells: "all",
  seed: 1,
  taskVersion: latestTaskVersion,
});

describe("bakeRoomClaimsToColorIndices", () => {
  it("maps an unclaimed cell to 0", () => {
    const state = makeState({ 0: [] });
    expect(bakeRoomClaimsToColorIndices(state, "team-0")[0]).toBe(0);
  });

  it("maps a single-team claim to that team's palette index", () => {
    const state = makeState({ 0: ["team-1"] });
    expect(bakeRoomClaimsToColorIndices(state, null)[0]).toBe(2);
  });

  it("prefers the caller's own team when a cell has multiple claimants", () => {
    const state = makeState({ 0: ["team-1", "team-0"] });
    expect(bakeRoomClaimsToColorIndices(state, "team-0")[0]).toBe(1);
  });

  it("falls back to the first claimant when the caller's own team never claimed it", () => {
    const state = makeState({ 0: ["team-1"] });
    expect(bakeRoomClaimsToColorIndices(state, "team-0")[0]).toBe(2);
  });
});
