import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { latestTaskVersion } from "../../features/store/versions/taskVersion";
import { JOIN_TIMEOUT_MS, RoomSession, type RoomRole } from "./roomSession";
import {
  effectiveClaimSharing,
  type RevealSettings,
  type RoomState,
  type Team,
} from "./types";

vi.mock("trystero");

// __setSelfId/__resetTrysteroNetwork only exist on the __mocks__/trystero.ts
// test double, not the real package's types.
const trysteroMock = await import("trystero");
const { __setSelfId, __resetTrysteroNetwork } = trysteroMock as unknown as {
  __setSelfId: (id: string) => void;
  __resetTrysteroNetwork: () => void;
};

const BOARD_SETTINGS = { seed: 1, taskVersion: latestTaskVersion };

// The mock's peer-discovery notifications are deferred a microtask (see
// __mocks__/trystero.ts) to mirror real WebRTC handshakes never completing
// synchronously within joinRoom() itself. Await this after any joinAs()
// call before asserting on state that depends on the join having reached
// the other peer(s).
const flushAsync = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

const makeTeams = (count: number): Team[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `team-${i}`,
    color: `#${i}${i}${i}`,
    name: `Team ${i + 1}`,
  }));

// Every test spins up its own set of "windows" (one per simulated peer) via
// this helper, mirroring how RoomDialog wires a session up in the real app.
const makeCallbacks = () => {
  const states: RoomState[] = [];
  const roles: RoomRole[] = [];
  return {
    onStateChange: vi.fn((state: RoomState) => states.push(state)),
    onRoleChange: vi.fn((role: RoomRole) => roles.push(role)),
    onJoinTimeout: vi.fn(),
    states,
    roles,
  };
};

const hostAs = (
  peerId: string,
  teams: Team[],
  callbacks: ReturnType<typeof makeCallbacks>,
  revealSettings: RevealSettings = {
    startHidden: false,
    endsRoomOnReveal: false,
  },
) => {
  __setSelfId(peerId);
  return RoomSession.host(
    `Host-${peerId}`,
    teams,
    "classic",
    "exclusive",
    revealSettings,
    BOARD_SETTINGS,
    callbacks,
  );
};

const joinAs = (
  peerId: string,
  roomId: string,
  callbacks: ReturnType<typeof makeCallbacks>,
  name = `Guest-${peerId}`,
) => {
  __setSelfId(peerId);
  return RoomSession.join(name, roomId, callbacks);
};

beforeEach(() => {
  __resetTrysteroNetwork();
});

describe("RoomSession.host", () => {
  it("creates a room whose only player is the host, on the host's own team", () => {
    const callbacks = makeCallbacks();
    const teams = makeTeams(2);
    const session = hostAs("host", teams, callbacks);

    expect(session.peerId).toBe("host");
    const state = callbacks.states.at(-1);
    expect(state?.hostId).toBe("host");
    expect(state?.players).toEqual([
      { peerId: "host", name: "Host-host", teamId: "team-0" },
    ]);
    expect(state?.cellClaims.every((claims) => claims.length === 0)).toBe(true);
    expect(
      state?.cellMemos.every((memos) => Object.keys(memos).length === 0),
    ).toBe(true);
    expect(state && effectiveClaimSharing(state)).toBe("exclusive");
    expect(state?.revealedCells).toBe("all");
  });
});

describe("guest join flow", () => {
  it("adds a joining guest to the host's player list with round-robin team assignment", async () => {
    const hostCallbacks = makeCallbacks();
    const teams = makeTeams(2);
    const host = hostAs("host", teams, hostCallbacks);

    const guest1Callbacks = makeCallbacks();
    joinAs("guest-1", host.roomId, guest1Callbacks);
    const guest2Callbacks = makeCallbacks();
    joinAs("guest-2", host.roomId, guest2Callbacks);
    await flushAsync();

    const finalState = hostCallbacks.states.at(-1);
    expect(finalState?.players.map((p) => p.peerId)).toEqual([
      "host",
      "guest-1",
      "guest-2",
    ]);
    // Host defaults to team-0, so joiners round-robin starting at team-1.
    expect(finalState?.players[1].teamId).toBe("team-1");
    expect(finalState?.players[2].teamId).toBe("team-0");

    // Every guest ends up with the same state the host broadcast.
    expect(guest1Callbacks.states.at(-1)).toEqual(finalState);
    expect(guest2Callbacks.states.at(-1)).toEqual(finalState);
  });

  it("does not duplicate a player who re-announces on seeing a new peer join", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(2), hostCallbacks);
    const guestCallbacks = makeCallbacks();
    joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();
    expect(hostCallbacks.states.at(-1)?.players).toHaveLength(2);

    // guest-1 doesn't know who currently holds host authority, so it
    // re-announces itself (another "join-request") on every newly seen
    // peer — see RoomSession's onPeerJoin comment. A second guest joining
    // triggers exactly that for guest-1; the host must not add it twice.
    joinAs("guest-2", host.roomId, makeCallbacks());
    await flushAsync();

    const finalState = hostCallbacks.states.at(-1);
    expect(finalState?.players.map((p) => p.peerId)).toEqual([
      "host",
      "guest-1",
      "guest-2",
    ]);
  });
});

describe("claimCell", () => {
  it("lets a guest with a team claim an unclaimed cell in classic mode", async () => {
    const hostCallbacks = makeCallbacks();
    const teams = makeTeams(2);
    const host = hostAs("host", teams, hostCallbacks);
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();

    guest.claimCell(3);

    const state = hostCallbacks.states.at(-1);
    // guest-1 landed on team-1 (see round-robin test above).
    expect(state?.cellClaims[3]).toEqual(["team-1"]);
    expect(guestCallbacks.states.at(-1)?.cellClaims[3]).toEqual(["team-1"]);
  });

  it("ignores a claim from a player with no team assigned", () => {
    const hostCallbacks = makeCallbacks();
    // No teams at all, so the host itself has teamId: null.
    const host = hostAs("host", [], hostCallbacks);

    host.claimCell(0);

    expect(hostCallbacks.states.at(-1)?.cellClaims[0]).toEqual([]);
  });

  it("ignores a claim on an already-claimed cell in exclusive (default) sharing", async () => {
    const hostCallbacks = makeCallbacks();
    const teams = makeTeams(2);
    const host = hostAs("host", teams, hostCallbacks);
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();

    host.claimCell(5);
    const stateAfterHostClaim = hostCallbacks.states.at(-1);
    guest.claimCell(5);

    expect(hostCallbacks.states.at(-1)).toEqual(stateAfterHostClaim);
    expect(hostCallbacks.states.at(-1)?.cellClaims[5]).toEqual(["team-0"]);
  });

  it("re-claiming a cell my own team already holds is a no-op", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.claimCell(2);
    const stateAfterFirstClaim = hostCallbacks.states.at(-1);

    host.claimCell(2);

    expect(hostCallbacks.states.at(-1)).toEqual(stateAfterFirstClaim);
  });

  it("lets two different teams claim the same cell once sharing is set to shared", async () => {
    const hostCallbacks = makeCallbacks();
    const teams = makeTeams(2);
    const host = hostAs("host", teams, hostCallbacks);
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();
    host.setClaimSharing("shared");

    host.claimCell(7);
    guest.claimCell(7);

    const state = hostCallbacks.states.at(-1);
    expect(state?.cellClaims[7]).toEqual(["team-0", "team-1"]);
  });
});

describe("unclaimCell", () => {
  it("removes my team's claim in classic mode", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.claimCell(4);

    host.unclaimCell(4);

    expect(hostCallbacks.states.at(-1)?.cellClaims[4]).toEqual([]);
  });

  it("is a no-op on a cell my team never claimed", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    const stateBeforeUnclaim = hostCallbacks.states.at(-1);

    host.unclaimCell(4);

    expect(hostCallbacks.states.at(-1)).toEqual(stateBeforeUnclaim);
  });

  it("is always a no-op in othello, even after switching sharing to shared", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.setMode("othello");
    host.claimCell(12);
    const stateAfterClaim = hostCallbacks.states.at(-1);

    host.unclaimCell(12);

    expect(hostCallbacks.states.at(-1)).toEqual(stateAfterClaim);
    expect(hostCallbacks.states.at(-1)?.cellClaims[12]).toEqual(["team-0"]);
  });
});

describe("claim sharing", () => {
  it("forces sharing back to exclusive when switching to othello, even from shared", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.setClaimSharing("shared");
    const beforeOthello = hostCallbacks.states.at(-1);
    expect(beforeOthello && effectiveClaimSharing(beforeOthello)).toBe(
      "shared",
    );

    host.setMode("othello");

    // Not just "still resolves as exclusive" — othello's state genuinely
    // has no claimSharing field to disagree with that at all anymore (see
    // RoomState's own comment).
    const afterOthello = hostCallbacks.states.at(-1);
    expect(afterOthello && "claimSharing" in afterOthello).toBe(false);
    expect(afterOthello && effectiveClaimSharing(afterOthello)).toBe(
      "exclusive",
    );
  });

  it("rejects switching to shared while already in othello mode", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.setMode("othello");
    const stateBefore = hostCallbacks.states.at(-1);

    host.setClaimSharing("shared");

    expect(hostCallbacks.states.at(-1)).toEqual(stateBefore);
  });
});

describe("host unconditional overrides", () => {
  it("setTeamClaim bypasses canClaim (e.g. an unrevealed hidden-mode cell)", () => {
    const hostCallbacks = makeCallbacks();
    const teams = makeTeams(2);
    const host = hostAs("host", teams, hostCallbacks);
    host.setMode("hidden");
    const unrevealedIndex = 0;
    expect(hostCallbacks.states.at(-1)?.revealedCells).not.toContain(
      unrevealedIndex,
    );

    host.setTeamClaim(unrevealedIndex, "team-1", true);

    expect(hostCallbacks.states.at(-1)?.cellClaims[unrevealedIndex]).toEqual([
      "team-1",
    ]);
  });

  it("setTeamClaim can put a second team on an othello cell, bypassing exclusivity", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(2), hostCallbacks);
    host.setMode("othello");
    host.claimCell(10);

    host.setTeamClaim(10, "team-1", true);

    expect(hostCallbacks.states.at(-1)?.cellClaims[10]).toEqual([
      "team-0",
      "team-1",
    ]);
  });

  it("clearCellClaims empties a cell regardless of how many teams claimed it", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(2), hostCallbacks);
    host.setClaimSharing("shared");
    host.claimCell(6);
    host.setTeamClaim(6, "team-1", true);
    expect(hostCallbacks.states.at(-1)?.cellClaims[6]).toHaveLength(2);

    host.clearCellClaims(6);

    expect(hostCallbacks.states.at(-1)?.cellClaims[6]).toEqual([]);
  });
});

describe("memo", () => {
  it("sets and clears a team's own memo independently of other teams'", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(2), hostCallbacks);

    host.setMyMemo(0, "⭐");
    expect(hostCallbacks.states.at(-1)?.cellMemos[0]).toEqual({
      "team-0": "⭐",
    });

    host.setTeamMemo(0, "team-1", "🔥");
    expect(hostCallbacks.states.at(-1)?.cellMemos[0]).toEqual({
      "team-0": "⭐",
      "team-1": "🔥",
    });

    host.setMyMemo(0, null);
    expect(hostCallbacks.states.at(-1)?.cellMemos[0]).toEqual({
      "team-1": "🔥",
    });
  });

  it("clears a removed team's memo entries across all cells", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(2), hostCallbacks);
    host.setMyMemo(0, "⭐");
    host.setTeamMemo(1, "team-1", "🔥");

    host.removeTeamAt(1);

    const state = hostCallbacks.states.at(-1);
    expect(state?.cellMemos[0]).toEqual({ "team-0": "⭐" });
    expect(state?.cellMemos[1]).toEqual({});
  });

  it("resets every cell's memos when the mode or board settings change", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.setMyMemo(0, "⭐");

    host.setMode("hidden");

    expect(
      hostCallbacks.states
        .at(-1)
        ?.cellMemos.every((memos) => Object.keys(memos).length === 0),
    ).toBe(true);
  });
});

describe("rename", () => {
  it("updates the host's own name locally", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.rename("New Host Name");
    expect(hostCallbacks.states.at(-1)?.players[0].name).toBe("New Host Name");
  });

  it("propagates a guest's rename to the host and back out to everyone", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();

    guest.rename("Renamed Guest");

    const guestEntry = hostCallbacks.states
      .at(-1)
      ?.players.find((p) => p.peerId === "guest-1");
    expect(guestEntry?.name).toBe("Renamed Guest");
    expect(
      guestCallbacks.states.at(-1)?.players.find((p) => p.peerId === "guest-1")
        ?.name,
    ).toBe("Renamed Guest");
  });
});

describe("team management", () => {
  it("adds a team and unassigns players when their team is removed", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.claimCell(0);

    host.addTeam("#abcdef");
    let state = hostCallbacks.states.at(-1);
    expect(state?.teams).toHaveLength(2);
    expect(state?.teams[1].name).toBe("Team 2");

    host.removeTeamAt(0);
    state = hostCallbacks.states.at(-1);
    expect(state?.teams).toHaveLength(1);
    expect(state?.teams[0].name).toBe("Team 1");
    // The host was on team-0, which was just removed.
    expect(state?.players[0].teamId).toBeNull();
    // The removed team's id is stripped out of cellClaims, not nulled out
    // wholesale — any other team's claim on the same cell would survive.
    expect(state?.cellClaims[0]).toEqual([]);
  });
});

describe("setMode / updateBoardSettings", () => {
  it("resets claims, memos, and reveal state when the mode changes", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.claimCell(0);
    host.setMyMemo(0, "⭐");
    expect(hostCallbacks.states.at(-1)?.cellClaims[0]).toEqual(["team-0"]);

    host.setMode("hidden");

    const state = hostCallbacks.states.at(-1);
    expect(state?.mode).toBe("hidden");
    expect(state?.cellClaims.every((claims) => claims.length === 0)).toBe(true);
    expect(
      state?.cellMemos.every((memos) => Object.keys(memos).length === 0),
    ).toBe(true);
    expect(state?.revealedCells).not.toBe("all");
  });

  it("resets claims when the board settings (seed/version) change", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.claimCell(1);

    host.updateBoardSettings({ seed: 99, taskVersion: latestTaskVersion });

    const state = hostCallbacks.states.at(-1);
    expect(state?.seed).toBe(99);
    expect(state?.cellClaims.every((claims) => claims.length === 0)).toBe(true);
  });
});

describe("revealBoard", () => {
  it("reveals every cell and, with endsRoomOnReveal, tears the room down for every peer", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks, {
      startHidden: true,
      endsRoomOnReveal: true,
    });
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();

    host.revealBoard();

    const state = hostCallbacks.states.at(-1);
    expect(state?.revealedCells).toBe("all");
    expect(state?.boardRevealed).toBe(true);
    expect(guestCallbacks.states.at(-1)?.boardRevealed).toBe(true);

    // The guest hears the reveal via state-sync and calls its own leave()
    // (see RoomSession's stateSync.onMessage), which sets its `left` guard —
    // a claim attempted afterward must be a silent no-op, not a crash or a
    // message the (already torn-down) host somehow still reacts to.
    const stateChangesBeforeClaim =
      hostCallbacks.onStateChange.mock.calls.length;
    expect(() => guest.claimCell(2)).not.toThrow();
    expect(hostCallbacks.onStateChange.mock.calls.length).toBe(
      stateChangesBeforeClaim,
    );
  });

  // The exact regression this describe block guards against: othello (and
  // anything else) needs the curtain open to be playable at all, so
  // starting hidden must not force the room to end the moment it's
  // revealed unless endsRoomOnReveal was separately opted into.
  it("reveals every cell without tearing the room down when the room started hidden but doesn't end on reveal", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks, {
      startHidden: true,
      endsRoomOnReveal: false,
    });
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();

    host.revealBoard();

    expect(hostCallbacks.states.at(-1)?.boardRevealed).toBe(true);
    expect(guestCallbacks.states.at(-1)?.boardRevealed).toBe(true);

    // Neither side left — a claim afterward should still go through
    // normally, unlike the endsRoomOnReveal case above where the same call
    // would silently no-op against an already-torn-down session.
    const stateChangesBeforeClaim =
      hostCallbacks.onStateChange.mock.calls.length;
    guest.claimCell(2);
    await flushAsync();
    expect(hostCallbacks.onStateChange.mock.calls.length).toBeGreaterThan(
      stateChangesBeforeClaim,
    );
    expect(hostCallbacks.states.at(-1)?.cellClaims[2]).toContain("team-0");
  });

  it("reveals every cell without tearing the room down when the room never started hidden", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    host.setMode("hidden");
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();

    host.revealBoard();

    expect(hostCallbacks.states.at(-1)?.revealedCells).toBe("all");
    expect(guestCallbacks.states.at(-1)?.revealedCells).toBe("all");

    const stateChangesBeforeClaim =
      hostCallbacks.onStateChange.mock.calls.length;
    guest.claimCell(2);
    await flushAsync();
    expect(hostCallbacks.onStateChange.mock.calls.length).toBeGreaterThan(
      stateChangesBeforeClaim,
    );
    expect(hostCallbacks.states.at(-1)?.cellClaims[2]).toContain("team-0");
  });
});

describe("setBoardRevealed / setEndsRoomOnReveal", () => {
  it("opens the curtain directly without touching revealedCells", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks, {
      startHidden: true,
      endsRoomOnReveal: false,
    });
    // "hidden" starts with only a small partial set revealed (see
    // modes/hidden.ts) — classic (hostAs' default) starts at "all" already,
    // which wouldn't actually prove anything stayed untouched.
    host.setMode("hidden");
    const revealedCellsBeforeCurtain =
      hostCallbacks.states.at(-1)?.revealedCells;

    host.setBoardRevealed(true);

    const state = hostCallbacks.states.at(-1);
    expect(state?.boardRevealed).toBe(true);
    expect(state?.revealedCells).toEqual(revealedCellsBeforeCurtain);
  });

  it("can re-close an already-open curtain for another round", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);

    host.setBoardRevealed(false);

    expect(hostCallbacks.states.at(-1)?.boardRevealed).toBe(false);
  });

  it("ends the room when opening the curtain directly, same as revealBoard(), if endsRoomOnReveal is on", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks, {
      startHidden: true,
      endsRoomOnReveal: true,
    });
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", host.roomId, guestCallbacks);
    await flushAsync();

    host.setBoardRevealed(true);

    expect(guestCallbacks.states.at(-1)?.boardRevealed).toBe(true);
    expect(() => guest.claimCell(0)).not.toThrow();
    expect(hostCallbacks.states.at(-1)?.cellClaims[0]).toEqual([]);
  });

  // The bug found while building this: without transition detection, a
  // room where the curtain was already open before endsRoomOnReveal got
  // switched on would incorrectly end right there, even though nothing
  // about the curtain itself just changed.
  it("does not end the room when switching endsRoomOnReveal on while the curtain is already open", () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);

    host.setEndsRoomOnReveal(true);

    expect(hostCallbacks.states.at(-1)?.endsRoomOnReveal).toBe(true);
    expect(() => host.claimCell(0)).not.toThrow();
    expect(hostCallbacks.states.at(-1)?.cellClaims[0]).toContain("team-0");
  });
});

describe("host handover", () => {
  it("promotes the lowest-peerId survivor when the host disconnects", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(2), hostCallbacks);
    const guestBCallbacks = makeCallbacks();
    joinAs("guest-b", host.roomId, guestBCallbacks);
    const guestACallbacks = makeCallbacks();
    joinAs("guest-a", host.roomId, guestACallbacks);
    await flushAsync();

    host.leave();

    // "guest-a" < "guest-b" lexicographically, so it should win the handover.
    expect(guestACallbacks.roles).toEqual(["host"]);
    expect(guestBCallbacks.roles).toEqual([]);

    const winnerState = guestACallbacks.states.at(-1);
    expect(winnerState?.hostId).toBe("guest-a");
    expect(winnerState?.epoch).toBe(1);
    expect(winnerState?.players.map((p) => p.peerId).sort()).toEqual([
      "guest-a",
      "guest-b",
    ]);

    // The non-winner computes the same result locally without waiting for
    // the new host's broadcast.
    const loserState = guestBCallbacks.states.at(-1);
    expect(loserState?.hostId).toBe("guest-a");
    expect(loserState?.epoch).toBe(1);
  });
});

describe("RoomSession.resumeHosting", () => {
  it("re-hosts the same room under a fresh peerId, bumping epoch and keeping room settings", () => {
    const hostCallbacks = makeCallbacks();
    const original = hostAs("host-old", makeTeams(2), hostCallbacks);
    const lastKnownState = hostCallbacks.states.at(-1);
    if (!lastKnownState) throw new Error("expected an initial state");
    original.leave();

    __setSelfId("host-new");
    const resumedCallbacks = makeCallbacks();
    const resumed = RoomSession.resumeHosting(
      lastKnownState,
      "Host-new",
      resumedCallbacks,
    );

    expect(resumed.roomId).toBe(original.roomId);
    expect(resumed.peerId).toBe("host-new");
    const state = resumedCallbacks.states.at(-1);
    expect(state?.hostId).toBe("host-new");
    expect(state?.epoch).toBe(lastKnownState.epoch + 1);
    expect(state?.players).toEqual([
      { peerId: "host-new", name: "Host-new", teamId: "team-0" },
    ]);
    expect(state?.teams).toEqual(lastKnownState.teams);
    expect(state?.seed).toBe(lastKnownState.seed);
  });

  it("lets a new guest join the resumed room normally", async () => {
    const hostCallbacks = makeCallbacks();
    const original = hostAs("host-old", makeTeams(2), hostCallbacks);
    const lastKnownState = hostCallbacks.states.at(-1);
    if (!lastKnownState) throw new Error("expected an initial state");
    original.leave();

    __setSelfId("host-new");
    const resumedCallbacks = makeCallbacks();
    const resumed = RoomSession.resumeHosting(
      lastKnownState,
      "Host-new",
      resumedCallbacks,
    );

    const guestCallbacks = makeCallbacks();
    joinAs("guest-1", resumed.roomId, guestCallbacks);
    await flushAsync();

    expect(
      resumedCallbacks.states.at(-1)?.players.map((p) => p.peerId),
    ).toEqual(["host-new", "guest-1"]);
  });
});

describe("join timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("gives up and calls onJoinTimeout after JOIN_TIMEOUT_MS if nobody ever answers", async () => {
    // No hostAs() call at all — "guest-1" is joining a room nobody is
    // actually in, the exact case that used to hang on RoomConnectingPanel
    // forever (see reconnectToRoomAtom's own comment on the bug this fixes
    // one layer up).
    const guestCallbacks = makeCallbacks();
    const guest = joinAs("guest-1", "nonexistent-room", guestCallbacks);

    await vi.advanceTimersByTimeAsync(JOIN_TIMEOUT_MS);

    expect(guestCallbacks.onJoinTimeout).toHaveBeenCalledOnce();
    expect(guestCallbacks.states).toEqual([]);
    // leave() already ran as part of the timeout — a call afterward must
    // be a silent no-op, same guard as the curtain-reveal test above.
    expect(() => guest.claimCell(0)).not.toThrow();
  });

  it("does not time out once a real state arrives first", async () => {
    const hostCallbacks = makeCallbacks();
    const host = hostAs("host", makeTeams(1), hostCallbacks);
    const guestCallbacks = makeCallbacks();
    joinAs("guest-1", host.roomId, guestCallbacks);
    await vi.advanceTimersByTimeAsync(0); // flushes the mock's peer-join

    expect(guestCallbacks.states).not.toEqual([]);

    await vi.advanceTimersByTimeAsync(JOIN_TIMEOUT_MS);

    expect(guestCallbacks.onJoinTimeout).not.toHaveBeenCalled();
  });

  it("never fires for a host, which always has state synchronously", async () => {
    const hostCallbacks = makeCallbacks();
    hostAs("host", makeTeams(1), hostCallbacks);

    await vi.advanceTimersByTimeAsync(JOIN_TIMEOUT_MS);

    expect(hostCallbacks.onJoinTimeout).not.toHaveBeenCalled();
  });
});
