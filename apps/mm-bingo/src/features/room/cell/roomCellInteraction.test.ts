import { describe, expect, it } from "vitest";

import type { RoomState } from "../../../libs/room/types";
import type { Cell } from "../../store/board";
import { CELLS_COUNT } from "../../store/board";
import type { RoomIdentity } from "../../store/room";
import { latestTaskVersion } from "../../store/versions/taskVersion";
import { computeRoomCellInteraction } from "./roomCellInteraction";

const makeCell = (index: number): Cell => ({
  text: { en: `task-${index}` },
  index,
  indexColor: 0,
  lineTypes: [],
  trackers: [],
  rect: { width: 0, height: 0 },
  isEmpty: false,
  isFallback: false,
});

// Defaults to a curtain-closed room (boardRevealed false) in an otherwise
// ordinary mode — see RoomState's own comment on why the curtain (a
// host-controlled, mode-independent "hide it from viewers") is a separate
// concern from revealedCells (a per-mode, rule-mandated gate). classic
// itself has no rule-mandated hiding at all, which is exactly the point:
// any hiding these tests see comes from the curtain alone.
const makeState = (overrides: Partial<RoomState> = {}): RoomState => ({
  roomId: "room",
  mode: "classic",
  hostId: "host",
  epoch: 0,
  teams: [
    { id: "team-0", color: "#111111", name: "Team 1" },
    { id: "team-1", color: "#222222", name: "Team 2" },
  ],
  players: [
    { peerId: "host", name: "Host", teamId: "team-0" },
    { peerId: "guest", name: "Guest", teamId: "team-1" },
  ],
  cellClaims: Array.from({ length: CELLS_COUNT }, () => []),
  cellMemos: Array.from({ length: CELLS_COUNT }, () => ({})),
  claimSharing: "exclusive",
  revealedCells: "all",
  boardRevealed: false,
  endsRoomOnReveal: false,
  seed: 1,
  taskVersion: latestTaskVersion,
  ...overrides,
});

const hostIdentity: RoomIdentity = { peerId: "host", role: "host" };
const guestIdentity: RoomIdentity = { peerId: "guest", role: "guest" };

const interactionFor = (
  state: RoomState,
  identity: RoomIdentity,
): ReturnType<typeof computeRoomCellInteraction> =>
  computeRoomCellInteraction({
    cell: makeCell(0),
    roomState: state,
    connection: undefined,
    identity,
    menuOpen: true,
    setMenuOpen: () => {},
  });

describe("computeRoomCellInteraction — curtain host pre-reveal lock", () => {
  it("blocks the host's own plain-click self-claim before the reveal", () => {
    const state = makeState();

    const interaction = interactionFor(state, hostIdentity);

    expect(interaction.locked).toBe(true);
    interaction.onClick();
    expect(state.cellClaims[0]).toEqual([]);
  });

  it("still lets a guest self-claim before the reveal — that's the curtain's whole point", () => {
    const state = makeState();

    const interaction = interactionFor(state, guestIdentity);

    expect(interaction.locked).toBe(false);
  });

  it("disables every override-menu row for the host before the reveal, including their own team", () => {
    const state = makeState();

    const interaction = interactionFor(state, hostIdentity);

    expect(interaction.claimMenu?.rows.length).toBeGreaterThan(0);
    expect(
      interaction.claimMenu?.rows.every((row) => row.onToggle === undefined),
    ).toBe(true);
    expect(interaction.claimMenu?.onClearAll).toBeUndefined();
  });

  it("lets the host act normally again once the curtain is lifted", () => {
    const state = makeState({ boardRevealed: true });

    const interaction = interactionFor(state, hostIdentity);

    expect(interaction.locked).toBe(false);
    expect(
      interaction.claimMenu?.rows.every((row) => row.onToggle !== undefined),
    ).toBe(true);
  });

  it("applies regardless of mode — it's a curtain concern, not a per-mode one", () => {
    const state = makeState({ mode: "hidden" });

    const interaction = interactionFor(state, hostIdentity);

    expect(interaction.locked).toBe(true);
  });
});

describe("computeRoomCellInteraction — rule-mandated reveal vs the curtain", () => {
  it("lets a guest claim a hidden-mode cell that's already rule-revealed, even while the curtain's still closed", () => {
    const state = makeState({
      mode: "hidden",
      revealedCells: [0],
      boardRevealed: false,
    });

    const interaction = interactionFor(state, guestIdentity);

    expect(interaction.locked).toBe(false);
  });

  it("blocks a guest from claiming a hidden-mode cell that isn't rule-revealed yet, even with the curtain fully open", () => {
    const state = makeState({
      mode: "hidden",
      revealedCells: [],
      boardRevealed: true,
    });

    const interaction = interactionFor(state, guestIdentity);

    expect(interaction.locked).toBe(true);
  });
});
