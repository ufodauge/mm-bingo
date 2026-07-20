import type { TaskVersion } from "../../features/store/versions/taskVersion";

export type PeerId = string;

export type Team = {
  id: string;
  color: string;
  name: string;
};

export type Player = {
  peerId: PeerId;
  name: string;
  teamId: string | null;
};

export type GameModeId = "classic" | "hidden" | "othello";

export type BoardSettings = {
  seed: number;
  taskVersion: TaskVersion;
};

// Room-creation-only choices for the boardRevealed curtain (see
// RoomStateCommon's own comment) — bundled the same way BoardSettings
// bundles seed/taskVersion, partly for the same "these travel together"
// reason and partly because two adjacent bare booleans in a positional
// argument list (see RoomSession.host) are too easy to transpose by
// accident.
export type RevealSettings = {
  // Starts the room with the curtain closed.
  startHidden: boolean;
  // Whether revealing (see RoomSession.revealBoard) also ends the room for
  // everyone, old "blind mode" style — independent of startHidden: a room
  // can start hidden and just keep going once revealed (e.g. othello,
  // which needs the curtain open to be playable at all but has no reason
  // to end there), or never start hidden yet still end the moment the host
  // chooses to "reveal" (nothing to actually reveal, but still a valid way
  // to trigger the same one-shot ending).
  endsRoomOnReveal: boolean;
};

export const GAME_MODE_IDS: GameModeId[] = ["classic", "hidden", "othello"];

// Orthogonal to GameModeId in principle: whether more than one team may
// claim the same cell. In practice "othello" is never actually orthogonal
// to it — its flip-cascade mechanic is fundamentally single-owner-per-cell,
// so there is no meaningful choice to make there at all. See RoomState
// below for how that's reflected in the type (not just enforced by
// convention at each write site).
export type ClaimSharing = "exclusive" | "shared";

type RoomStateCommon = {
  roomId: string;
  // Whoever currently holds host authority — not fixed for the room's
  // lifetime. If this peer disconnects, every remaining peer independently
  // elects the same successor (lowest peerId among the survivors) from
  // their own last-known `players` list, so the room outlives any single
  // host (see RoomSession's peer-leave handling). No player entry is
  // specially flagged as "the host" — compare `player.peerId === hostId`
  // wherever that's needed instead, so it can never go stale across a
  // handover.
  hostId: PeerId;
  // Bumped by exactly one on every host handover. Lets a receiving peer
  // resolve the rare case of two peers momentarily broadcasting under the
  // same epoch after a disconnect both computed themselves as the winner
  // (a real possibility without true consensus, if peers had briefly
  // diverging views of `players`): higher epoch always wins, and an
  // equal-epoch conflict is broken deterministically by lowest hostId, so
  // every peer converges on the same state even if they briefly disagreed
  // (see isStateNewer in roomSession.ts). Within a single epoch from a
  // single host, every broadcast is just newer content and is always
  // accepted, same as before this existed.
  epoch: number;
  teams: Team[];
  players: Player[];
  // index === cell index, value === claiming team ids, in claim order.
  // [] === unclaimed. Every mutation path except the host's unconditional
  // override (withTeamClaim) keeps this at length <= 1 whenever
  // claimSharing is "exclusive" — see withClaimAttempt.
  cellClaims: string[][];
  // index === cell index, value === map of teamId -> a single emoji.
  // Absent key === no memo for that team on that cell. Team-scoped (not
  // per-player): any teammate's edit overwrites the team's one entry for
  // that cell. Purely cosmetic — never read by any mode's canClaim/
  // applyClaim, never affects bakeRoomClaimsToColorIndices.
  cellMemos: Record<string, string>[];
  // The mode's OWN rule-mandated reveal progress — "all" means every cell
  // is eligible to be seen (classic, othello start here and never change).
  // A list of indices means only those cells are — in "hidden" mode this
  // also gates claiming (see modes/hidden.ts's canClaim); every other mode
  // ignores it for claiming and uses it only for display. This is *not*
  // the whole story on visibility by itself — see boardRevealed below,
  // which is a second, independent gate a viewer must also clear (see
  // useCellInteraction's textVisible, which is the AND of both).
  revealedCells: number[] | "all";
  // A host-controlled, mode-independent "curtain" — while false, every
  // cell's task text and every OTHER team's claims are hidden from every
  // viewer, regardless of what revealedCells says about any individual
  // cell (a team can still see, and add to, its own claims the whole
  // time). This is "hiding so a viewer can't see it" — a presentation
  // choice orthogonal to the mode's own rules — as opposed to
  // revealedCells, which is "hiding a rule requires" (e.g. hidden mode's
  // claim-gating actually depends on it). Starts false only if the host
  // chose to at room creation (see RevealSettings' startHidden), but is
  // freely settable afterward too — either indirectly via the host's
  // "reveal everything" action (see RoomSession.revealBoard) or directly,
  // in either direction, via RoomSession.setBoardRevealed (e.g. a host
  // re-closing it for another curtain round after a mode/seed change
  // already reset the board anyway). Not inherently tied to the room's
  // lifecycle: revealing does NOT end the room by itself (needed for e.g.
  // othello, which requires the curtain open to be playable at all, with
  // no reason for that to also be the game's end) — see endsRoomOnReveal
  // below for the opt-in, independent way to get that consequence back.
  boardRevealed: boolean;
  // Whether THIS room ends for everyone the moment boardRevealed becomes
  // true (see RoomSession.revealBoard, applyRoomStateAtom, and RoomSession's
  // stateSync.onMessage, which all watch for exactly this combination) —
  // decided at room creation (see RevealSettings) alongside, but
  // independently of, startHidden, and — like boardRevealed — freely
  // settable afterward too, via RoomSession.setEndsRoomOnReveal. This is
  // what "blind mode" used to be: start hidden AND end on reveal, bundled
  // as one hardcoded mode instead of two separate settings.
  endsRoomOnReveal: boolean;
  // The board is fully determined by (seed, taskVersion) via
  // generateTasksAsync, so broadcasting these is enough for every peer to
  // render the exact same board without transmitting task text itself.
  seed: number;
  taskVersion: TaskVersion;
};

// `mode` and `claimSharing` used to be two independent fields, which meant
// `{mode: "othello", claimSharing: "shared"}` was perfectly representable
// even though it's never actually valid — every reader that cared (host
// transitions in roomStateTransitions.ts, the mode pickers, the claim-menu
// gating) had to separately remember to re-clamp/re-resolve it, and at
// least one (withClaimAttempt's exclusive-mode check) didn't, silently
// accepting multiple claimants on an othello cell if that combination were
// ever actually reached (a future refactor slipping up, or a peer running
// different/tampered code). Modeling them as one discriminated union
// instead makes that combination impossible to construct in the first
// place: the "othello" branch has no `claimSharing` field to disagree with
// `mode` about, so there's nothing left to clamp. Use
// `effectiveClaimSharing` below wherever code needs a definite
// `ClaimSharing` regardless of which branch it's looking at.
export type RoomState = RoomStateCommon &
  (
    | { mode: "othello" }
    | { mode: "classic" | "hidden"; claimSharing: ClaimSharing }
  );

// The one place that still asks "what does claimSharing effectively mean
// right now" across both branches of RoomState — every other read site
// should either already be narrowed to the non-othello branch (e.g. inside
// an `if (state.mode !== "othello")`) or go through this instead of
// reaching for `state.claimSharing` directly, which the othello branch
// doesn't have at all.
export const effectiveClaimSharing = (state: RoomState): ClaimSharing =>
  state.mode === "othello" ? "exclusive" : state.claimSharing;

// Sent peer -> host over the "peer-to-host" Trystero action (see
// trysteroConfig.ts). The sender's PeerId comes from Trystero's own message
// context (it already knows who's talking to it), not from the payload —
// and a disconnecting peer is reported via Trystero's `onPeerLeave`, so
// there's no explicit "leave" message either.
export type PeerToHostMessage =
  | { type: "join-request"; name: string }
  | { type: "claim-cell"; cellIndex: number }
  | { type: "unclaim-cell"; cellIndex: number }
  | { type: "set-memo"; cellIndex: number; emoji: string | null }
  | { type: "rename"; name: string };
