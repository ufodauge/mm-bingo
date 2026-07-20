import i18next from "i18next";
import { createStore } from "jotai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../../i18n";
import type { RoomState } from "../../libs/room/types";
import { CELLS_COUNT } from "../store/board";
import { colorIndicesAtom } from "../store/colors/indices";
import { notificationsAtom } from "../store/notifications";
import {
  displayNameAtom,
  lastOwnPeerIdAtom,
  roomConnectionAtom,
  roomIdentityAtom,
  roomStateAtom,
  type RoomConnection,
} from "../store/room";
import { latestTaskVersion } from "../store/versions/taskVersion";
import { applyRoomStateAtom, reconnectToRoomAtom } from "./roomActions";

// reconnectToRoomAtom creates a real RoomSession (RoomSession.resumeHosting
// or RoomSession.join), which needs trystero mocked the same way
// roomSession.test.ts does — __setSelfId/__resetTrysteroNetwork only exist
// on the __mocks__/trystero.ts test double, not the real package's types.
vi.mock("trystero");
const trysteroMock = await import("trystero");
const { __setSelfId, __resetTrysteroNetwork } = trysteroMock as unknown as {
  __setSelfId: (id: string) => void;
  __resetTrysteroNetwork: () => void;
};

const makeState = (overrides: Partial<RoomState> = {}): RoomState => ({
  roomId: "room",
  mode: "classic",
  hostId: "host-a",
  epoch: 0,
  teams: [{ id: "team-0", color: "#111111", name: "Team 1" }],
  players: [
    { peerId: "host-a", name: "Alice", teamId: "team-0" },
    { peerId: "guest-1", name: "Bob", teamId: null },
    { peerId: "guest-2", name: "Charlie", teamId: null },
  ],
  cellClaims: Array.from({ length: CELLS_COUNT }, () => []),
  cellMemos: Array.from({ length: CELLS_COUNT }, () => ({})),
  claimSharing: "exclusive",
  revealedCells: "all",
  boardRevealed: true,
  endsRoomOnReveal: false,
  seed: 1,
  taskVersion: latestTaskVersion,
  ...overrides,
});

describe("applyRoomStateAtom — host handover notifications", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it("does not notify on the very first state (nothing to have changed from)", () => {
    store.set(applyRoomStateAtom, makeState());

    expect(store.get(notificationsAtom)).toEqual([]);
  });

  it("notifies with the new host's name when someone else becomes host", () => {
    store.set(roomStateAtom, makeState({ hostId: "host-a" }));
    // Bystander: not the departing host, and not the one being promoted
    // either — just someone else in the room hearing about it.
    store.set(roomIdentityAtom, { peerId: "guest-2", role: "guest" });

    store.set(applyRoomStateAtom, makeState({ hostId: "guest-1", epoch: 1 }));

    const notifications = store.get(notificationsAtom);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toBe(
      i18next.t("room.hostChanged", { name: "Bob" }),
    );
  });

  it("notifies 'you became host' when the new host is this window's own identity", () => {
    store.set(roomStateAtom, makeState({ hostId: "host-a" }));
    store.set(roomIdentityAtom, { peerId: "guest-1", role: "guest" });

    store.set(applyRoomStateAtom, makeState({ hostId: "guest-1", epoch: 1 }));

    expect(store.get(notificationsAtom)[0].message).toBe(
      i18next.t("room.youBecameHost"),
    );
  });

  it("does not notify when the host is unchanged", () => {
    store.set(roomStateAtom, makeState({ hostId: "host-a" }));

    store.set(
      applyRoomStateAtom,
      makeState({ hostId: "host-a", cellClaims: makeState().cellClaims }),
    );

    expect(store.get(notificationsAtom)).toEqual([]);
  });
});

describe("applyRoomStateAtom — curtain reveal ends the room", () => {
  let store: ReturnType<typeof createStore>;
  const fakeConnection = {
    role: "host",
    session: { peerId: "host-a" },
  } as RoomConnection;

  beforeEach(() => {
    store = createStore();
    // Baking-and-ending also carries the room's seed/version over to solo
    // play via queryParamsAtom, which touches document/history — real
    // browser APIs this plain-Node test environment doesn't have. Stubbed
    // minimally, only so that write doesn't throw; nothing here asserts on
    // it.
    vi.stubGlobal("document", {
      location: { href: "http://localhost/", pathname: "/" },
    });
    vi.stubGlobal("history", { state: null, replaceState: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("bakes claims into colorIndices and returns everyone to solo mode when boardRevealed actually transitions to true on an endsRoomOnReveal room", () => {
    const cellClaims = Array.from({ length: CELLS_COUNT }, (_, i) =>
      i === 0 ? ["team-0"] : [],
    );
    store.set(
      roomStateAtom,
      makeState({ endsRoomOnReveal: true, boardRevealed: false, cellClaims }),
    );
    store.set(roomIdentityAtom, { peerId: "host-a", role: "host" });
    store.set(roomConnectionAtom, fakeConnection);

    store.set(
      applyRoomStateAtom,
      makeState({ endsRoomOnReveal: true, boardRevealed: true, cellClaims }),
    );

    expect(store.get(colorIndicesAtom).at(0)).toBe(1);
    expect(store.get(roomConnectionAtom)).toBeUndefined();
    expect(store.get(roomStateAtom)).toBeNull();
  });

  // The bug this whole describe block exists to prevent a regression of:
  // othello (and anything else) needs the curtain open to be playable at
  // all, with no reason for that to also end the room — see RoomState's
  // own comment on why endsRoomOnReveal is independent of boardRevealed.
  it("does not end the room when boardRevealed transitions to true but endsRoomOnReveal is false", () => {
    store.set(
      roomStateAtom,
      makeState({ endsRoomOnReveal: false, boardRevealed: false }),
    );
    store.set(roomConnectionAtom, fakeConnection);

    store.set(
      applyRoomStateAtom,
      makeState({ endsRoomOnReveal: false, boardRevealed: true }),
    );

    expect(store.get(roomConnectionAtom)).toBe(fakeConnection);
    expect(store.get(roomStateAtom)).not.toBeNull();
  });

  it("does not end the room when endsRoomOnReveal is true but the curtain hasn't been lifted yet", () => {
    store.set(
      roomStateAtom,
      makeState({ endsRoomOnReveal: true, boardRevealed: false }),
    );
    store.set(roomConnectionAtom, fakeConnection);

    store.set(
      applyRoomStateAtom,
      makeState({ endsRoomOnReveal: true, boardRevealed: false }),
    );

    expect(store.get(roomConnectionAtom)).toBe(fakeConnection);
    expect(store.get(roomStateAtom)).not.toBeNull();
  });

  // The specific bug found while adding setBoardRevealed/setEndsRoomOnReveal
  // as freely post-creation-settable: without transition detection, this
  // exact combination (both already true, nothing about boardRevealed
  // actually changing this update) would incorrectly re-trigger baking on
  // every later, unrelated update to a room where endsRoomOnReveal just
  // happens to have been switched on after the curtain was already open.
  it("does not end the room when endsRoomOnReveal is switched on while the curtain is already open", () => {
    store.set(
      roomStateAtom,
      makeState({ endsRoomOnReveal: false, boardRevealed: true }),
    );
    store.set(roomConnectionAtom, fakeConnection);

    store.set(
      applyRoomStateAtom,
      makeState({ endsRoomOnReveal: true, boardRevealed: true }),
    );

    expect(store.get(roomConnectionAtom)).toBe(fakeConnection);
    expect(store.get(roomStateAtom)).not.toBeNull();
  });

  it("does not end the room on a fresh join, even if the very first state already shows endsRoomOnReveal and boardRevealed both true", () => {
    // previous is null here — nothing to have "transitioned" from, same
    // reasoning as the host-handover tests above.
    store.set(roomConnectionAtom, fakeConnection);

    store.set(
      applyRoomStateAtom,
      makeState({ endsRoomOnReveal: true, boardRevealed: true }),
    );

    expect(store.get(roomConnectionAtom)).toBe(fakeConnection);
    expect(store.get(roomStateAtom)).not.toBeNull();
  });
});

describe("reconnectToRoomAtom", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    __resetTrysteroNetwork();
  });

  it("resumes hosting under a fresh peerId when this tab's own last connection was that solo host", () => {
    const staleState = makeState({
      hostId: "host-old",
      epoch: 3,
      players: [{ peerId: "host-old", name: "Solo", teamId: "team-0" }],
    });
    store.set(roomStateAtom, staleState);
    store.set(displayNameAtom, "Solo");
    // What roomConnectionAtom's own setter would have left behind before
    // this tab's session died — see lastOwnPeerIdAtom's own comment on why
    // this, not just roomState's shape, is what actually gates resuming.
    store.set(lastOwnPeerIdAtom, "host-old");
    __setSelfId("host-new");

    store.set(reconnectToRoomAtom);

    expect(store.get(roomConnectionAtom)?.role).toBe("host");
    const state = store.get(roomStateAtom);
    expect(state?.hostId).toBe("host-new");
    expect(state?.epoch).toBe(4);
    expect(state?.players).toEqual([
      { peerId: "host-new", name: "Solo", teamId: "team-0" },
    ]);
  });

  it("rejoins as a guest when the stale state shows other players besides this one", () => {
    // makeState()'s default players list has three entries — there was
    // someone else in the room, so a survivor should already have taken
    // over as host (see RoomSession's peer-leave handling); nothing here
    // to resume.
    const staleState = makeState({ hostId: "host-a" });
    store.set(roomStateAtom, staleState);
    store.set(displayNameAtom, "Alice");
    store.set(lastOwnPeerIdAtom, "host-a");
    __setSelfId("host-a-new");

    store.set(reconnectToRoomAtom);

    expect(store.get(roomConnectionAtom)?.role).toBe("guest");
  });

  it("rejoins as a guest, not host, when a solo-looking snapshot is only mirrored from another tab", () => {
    // Same shape as the "resumes hosting" case above, but *without* this
    // tab ever having connected as "host-old" itself — e.g. a tab with no
    // live connection of its own that picked this snapshot up from another,
    // genuinely live tab (see ignoringOtherLiveTabs's comment on how that
    // mirroring works). Without lastOwnPeerIdAtom's check, this tab would
    // wrongly resume hosting a room a different tab is already, actively
    // hosting — a real split-brain reproduced live while building this fix.
    const staleState = makeState({
      hostId: "host-old",
      players: [{ peerId: "host-old", name: "Solo", teamId: "team-0" }],
    });
    store.set(roomStateAtom, staleState);
    store.set(displayNameAtom, "Bystander");
    __setSelfId("bystander-new");

    store.set(reconnectToRoomAtom);

    expect(store.get(roomConnectionAtom)?.role).toBe("guest");
  });
});
