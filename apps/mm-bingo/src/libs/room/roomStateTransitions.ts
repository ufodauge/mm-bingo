import { CELLS_COUNT } from "../../features/store/board";
import { classicMode } from "./modes/classic";
import { hiddenMode } from "./modes/hidden";
import { othelloMode } from "./modes/othello";
import type { GameModeStrategy } from "./modes/types";
import {
  effectiveClaimSharing,
  type BoardSettings,
  type ClaimSharing,
  type GameModeId,
  type PeerId,
  type RoomState,
} from "./types";

const emptyCellClaims = (): string[][] =>
  Array.from({ length: CELLS_COUNT }, () => []);
const emptyCellMemos = (): Record<string, string>[] =>
  Array.from({ length: CELLS_COUNT }, () => ({}));

// Every pure `RoomState -> RoomState` transformation RoomSession applies,
// lifted out of the class entirely. None of these touch `this` or trystero
// — they're plain functions of a state (and whatever the triggering
// message/call carried), so RoomSession's own methods reduce to "run this
// transform through updateHostState", and each transform is independently
// testable without any networking involved at all.
//
// A transform returns `null` instead of a new RoomState to mean "no actual
// change" (an invalid index, a claim that doesn't apply, a redundant
// rename) — RoomSession's updateHostState() treats that as "don't
// broadcast", so a transform that can't apply doesn't need its own
// separate validity check duplicated at the call site.

export const MODE_STRATEGIES: Record<GameModeId, GameModeStrategy> = {
  classic: classicMode,
  hidden: hiddenMode,
  othello: othelloMode,
};

const nextTeamName = (index: number): string => `Team ${index + 1}`;

export const withPlayerTeam = (
  state: RoomState,
  peerId: PeerId,
  teamId: string | null,
): RoomState => ({
  ...state,
  players: state.players.map((p) =>
    p.peerId === peerId ? { ...p, teamId } : p,
  ),
});

export const withPlayerName = (
  state: RoomState,
  peerId: PeerId,
  name: string,
): RoomState | null =>
  state.players.some((p) => p.peerId === peerId)
    ? {
        ...state,
        players: state.players.map((p) =>
          p.peerId === peerId ? { ...p, name } : p,
        ),
      }
    : null;

// Keeps teams in sync with the host's marker-color palette (teams are still
// built 1:1 from it — see buildTeamsFromMarkerColors — just kept live
// instead of frozen at room creation). withNewTeam/withoutTeamAt/
// withTeamColor mirror MarkerColorsAction 1:1 (see colors.ts) rather than
// taking the whole resulting palette and diffing it against the old one —
// a flat "new array of colors" has no identity to match against the old
// teams by itself (e.g. removing color 0 shifts every later color's array
// index down by one, which would wrongly look like "color 0 changed, color
// N was removed" if matched by position). Knowing which specific edit
// happened is what lets a team's id — and so any claims/assignments
// already made against it — survive edits to any OTHER team.
export const withNewTeam = (state: RoomState, color: string): RoomState => ({
  ...state,
  teams: [
    ...state.teams,
    {
      id: crypto.randomUUID(),
      color,
      name: nextTeamName(state.teams.length),
    },
  ],
});

export const withoutTeamAt = (
  state: RoomState,
  index: number,
): RoomState | null => {
  const removed = state.teams[index];
  if (!removed) {
    return null;
  }
  return {
    ...state,
    teams: state.teams
      .toSpliced(index, 1)
      .map((t, i) => ({ ...t, name: nextTeamName(i) })),
    cellClaims: state.cellClaims.map((claimants) =>
      claimants.includes(removed.id)
        ? claimants.filter((id) => id !== removed.id)
        : claimants,
    ),
    cellMemos: state.cellMemos.map((memos) => {
      if (!(removed.id in memos)) {
        return memos;
      }
      const { [removed.id]: _dropped, ...rest } = memos;
      return rest;
    }),
    players: state.players.map((p) =>
      p.teamId === removed.id ? { ...p, teamId: null } : p,
    ),
  };
};

export const withTeamColor = (
  state: RoomState,
  index: number,
  color: string,
): RoomState | null =>
  state.teams[index]
    ? {
        ...state,
        teams: state.teams.map((t, i) => (i === index ? { ...t, color } : t)),
      }
    : null;

// A new seed/version means a different board, so — like withMode() — any
// claims/reveal progress made against the old board no longer make sense
// and are reset. RoomDialog confirms with the host before triggering this
// for a deliberate reroll, since it affects every player's progress.
export const withBoardSettings = (
  state: RoomState,
  boardSettings: BoardSettings,
): RoomState => {
  const strategy = MODE_STRATEGIES[state.mode];
  return {
    ...state,
    seed: boardSettings.seed,
    taskVersion: boardSettings.taskVersion,
    cellClaims: emptyCellClaims(),
    cellMemos: emptyCellMemos(),
    revealedCells: strategy.initialRevealedCells(CELLS_COUNT),
  };
};

// Switching modes resets claims/reveal state — carrying them over between
// modes with different rules (e.g. a claim made under "hidden" being
// reinterpreted under "othello") would be more confusing than useful.
//
// Built from an explicit field list rather than `{ ...state, mode, ... }`:
// `state` may or may not carry a `claimSharing` (see RoomState's own
// comment on why that's a discriminated union now), and spreading it
// first would let a stale `claimSharing` from a non-othello mode leak into
// the "othello" branch's result even though that branch's type says it
// shouldn't have one — object spreads copy every own property regardless
// of what the surrounding object literal goes on to declare, so only
// listing the fields that are actually common to both branches keeps that
// from happening.
export const withMode = (state: RoomState, mode: GameModeId): RoomState => {
  const common = {
    roomId: state.roomId,
    hostId: state.hostId,
    epoch: state.epoch,
    teams: state.teams,
    players: state.players,
    cellClaims: emptyCellClaims(),
    cellMemos: emptyCellMemos(),
    revealedCells: MODE_STRATEGIES[mode].initialRevealedCells(CELLS_COUNT),
    // Deliberately carried over, not reset: boardRevealed/endsRoomOnReveal
    // are the host-controlled curtain settings (see RoomState's own
    // comment), decided once at room creation and unrelated to which mode
    // is currently active — switching modes mid-room shouldn't silently
    // force the curtain open (still mid-ceremony) or change whether
    // revealing ends the room.
    boardRevealed: state.boardRevealed,
    endsRoomOnReveal: state.endsRoomOnReveal,
    seed: state.seed,
    taskVersion: state.taskVersion,
  };
  return mode === "othello"
    ? { ...common, mode }
    : { ...common, mode, claimSharing: effectiveClaimSharing(state) };
};

// The host's "reveal everything now" action (see RoomSession.revealBoard):
// finishes the mode's own rule-mandated reveal progress AND lifts the
// boardRevealed curtain in one shot — both are "show everyone the board"
// in spirit, just at the two different layers RoomState now separates (see
// its own comment on revealedCells vs boardRevealed).
export const withBoardRevealed = (state: RoomState): RoomState => ({
  ...state,
  revealedCells: "all",
  boardRevealed: true,
});

// A direct, side-effect-free toggle of the curtain alone (see
// RoomSession.setBoardRevealed) — unlike withBoardRevealed above, this
// never touches revealedCells and never implies "the ceremony is over":
// available any time, including re-closing it, for a host who wants to run
// a curtain round mid-room (e.g. after a mode/seed change resets the board
// anyway) without going through the "reveal everything" action.
export const withCurtain = (
  state: RoomState,
  open: boolean,
): RoomState | null =>
  state.boardRevealed === open ? null : { ...state, boardRevealed: open };

// Also directly settable post-creation, independent of the curtain itself
// (see RevealSettings' own comment on why the two are independent) — see
// RoomSession.setEndsRoomOnReveal.
export const withEndsRoomOnReveal = (
  state: RoomState,
  endsRoomOnReveal: boolean,
): RoomState | null =>
  state.endsRoomOnReveal === endsRoomOnReveal
    ? null
    : { ...state, endsRoomOnReveal };

// A manual override for the host's context menu — bypasses each mode's own
// claim rules entirely (e.g. it won't trigger an othello flip cascade) and
// the exclusive/shared sharing policy below, since the point is to let the
// host directly force any team's claim on or off, including the host's own
// team. Unconditional for every team, same spirit as the old withCellClaim
// this replaces, just generalized to a per-team toggle now that a cell can
// hold more than one claimant.
export const withTeamClaim = (
  state: RoomState,
  cellIndex: number,
  teamId: string,
  claimed: boolean,
): RoomState | null => {
  const current = state.cellClaims[cellIndex];
  if (current.includes(teamId) === claimed) {
    return null;
  }
  const next = claimed
    ? [...current, teamId]
    : current.filter((id) => id !== teamId);
  return { ...state, cellClaims: state.cellClaims.with(cellIndex, next) };
};

// The host's "clear all claims on this cell" quick action — also
// unconditional, regardless of how many teams (or which mode) claimed it.
export const withClearedCellClaims = (
  state: RoomState,
  cellIndex: number,
): RoomState | null =>
  state.cellClaims[cellIndex].length === 0
    ? null
    : { ...state, cellClaims: state.cellClaims.with(cellIndex, []) };

// The one claim path every mode's rules actually run through — a player's
// own click and the host's unconditional override (withTeamClaim) both skip
// this deliberately: this is for claims that are supposed to earn their
// place on the board, not force one. The exclusive/shared sharing policy is
// cross-cutting (identical for every mode) so it lives here rather than
// being duplicated in each mode's own canClaim.
export const withClaimAttempt = (
  state: RoomState,
  peerId: PeerId,
  cellIndex: number,
): RoomState | null => {
  const player = state.players.find((p) => p.peerId === peerId);
  if (!player?.teamId) {
    return null;
  }
  const teamId = player.teamId;
  const claimants = state.cellClaims[cellIndex];
  if (claimants.includes(teamId)) {
    return null;
  }
  if (effectiveClaimSharing(state) === "exclusive" && claimants.length > 0) {
    return null;
  }
  const strategy = MODE_STRATEGIES[state.mode];
  if (!strategy.canClaim(state, cellIndex)) {
    return null;
  }
  return strategy.applyClaim(state, cellIndex, teamId);
};

// Mirrors withClaimAttempt for the new "undo my own claim" capability. No
// per-mode applyUnclaim is needed — "remove my team id from this cell's
// array" is identical everywhere unclaiming is allowed at all, which is
// exactly what GameModeStrategy.supportsUnclaim gates (false for othello:
// undoing a flip cascade is out of scope).
export const withUnclaimAttempt = (
  state: RoomState,
  peerId: PeerId,
  cellIndex: number,
): RoomState | null => {
  const player = state.players.find((p) => p.peerId === peerId);
  if (!player?.teamId) {
    return null;
  }
  const teamId = player.teamId;
  if (!MODE_STRATEGIES[state.mode].supportsUnclaim) {
    return null;
  }
  if (!state.cellClaims[cellIndex].includes(teamId)) {
    return null;
  }
  return {
    ...state,
    cellClaims: state.cellClaims.with(
      cellIndex,
      state.cellClaims[cellIndex].filter((id) => id !== teamId),
    ),
  };
};

// Host-unconditional AND self-team-usable core for the memo badge — memos
// are purely cosmetic (never read by any mode's canClaim/applyClaim, never
// affect bakeRoomClaimsToColorIndices), so there's nothing to validate
// either way and one function serves both callers (see roomSession.ts).
export const withTeamMemo = (
  state: RoomState,
  cellIndex: number,
  teamId: string,
  emoji: string | null,
): RoomState | null => {
  const current = state.cellMemos[cellIndex];
  if ((current[teamId] ?? null) === emoji) {
    return null;
  }
  const next = { ...current };
  if (emoji === null) {
    delete next[teamId];
  } else {
    next[teamId] = emoji;
  }
  return { ...state, cellMemos: state.cellMemos.with(cellIndex, next) };
};

// peerId->teamId resolving wrapper around withTeamMemo, used for the guest
// "set-memo" peer-to-host message — teamId is never trusted from the wire,
// exactly like claim-cell/unclaim-cell.
export const withOwnMemo = (
  state: RoomState,
  peerId: PeerId,
  cellIndex: number,
  emoji: string | null,
): RoomState | null => {
  const teamId = state.players.find((p) => p.peerId === peerId)?.teamId;
  return teamId ? withTeamMemo(state, cellIndex, teamId, emoji) : null;
};

// Host-only: othello has no `claimSharing` field to change at all (see
// RoomState) — its flip-cascade mechanic can't tolerate more than one
// claimant per cell, so a request to change it while already in othello
// mode is simply rejected rather than silently accepted and then ignored.
export const withClaimSharing = (
  state: RoomState,
  claimSharing: ClaimSharing,
): RoomState | null => {
  if (state.mode === "othello") {
    return null;
  }
  return state.claimSharing === claimSharing
    ? null
    : { ...state, claimSharing };
};

// A guest re-announces on every peer it newly sees (it can't tell which one
// currently holds host authority up front), so a repeat from an
// already-known peer is expected and not a new player.
export const withJoinRequest = (
  state: RoomState,
  peerId: PeerId,
  name: string,
): RoomState | null => {
  if (state.players.some((p) => p.peerId === peerId)) {
    return null;
  }
  // Round-robin starting one team after the host's own (team index 0 is
  // always the host's default), so joiners land on team 2, 3, 1, 2, ...
  // instead of everyone piling up on "no team" until the host manually
  // sorts them.
  const { teams, players } = state;
  const teamId =
    teams.length > 0 ? teams[players.length % teams.length].id : null;
  return {
    ...state,
    players: [...players, { peerId, name, teamId }],
  };
};

export const withoutPlayer = (
  state: RoomState,
  peerId: PeerId,
): RoomState | null =>
  state.players.some((p) => p.peerId === peerId)
    ? { ...state, players: state.players.filter((p) => p.peerId !== peerId) }
    : null;

// The host itself departed. Every survivor (the caller is necessarily one,
// since it's the one processing the event) independently computes the same
// deterministic successor — lowest peerId among the players who are left —
// from the same last-known `players` list, so everyone converges on the
// same next host without coordinating.
export const withHostHandover = (
  state: RoomState,
  departedHostId: PeerId,
  selfPeerId: PeerId,
): RoomState => {
  const survivors = state.players.filter((p) => p.peerId !== departedHostId);
  const nextHostId = survivors.reduce(
    (min, p) => (p.peerId < min ? p.peerId : min),
    survivors[0]?.peerId ?? selfPeerId,
  );
  return {
    ...state,
    hostId: nextHostId,
    players: survivors,
    epoch: state.epoch + 1,
  };
};

// Compares two RoomStates received over the wire to decide whether
// `candidate` should replace `current`. Within one host's tenure (same
// epoch, same hostId) this always says yes — there's only one legitimate
// writer per epoch, so every broadcast from it is just newer content, same
// assumption the old single-host implementation always made. It only
// matters once hostId or epoch actually differ: a higher epoch is a real
// handover and always wins; an equal-epoch conflict (two peers who both
// briefly believed themselves the winner of the same handover) is broken
// deterministically by lowest hostId, so every peer ends up choosing the
// same side even without talking to each other about it.
export const isStateNewer = (
  candidate: RoomState,
  current: RoomState,
): boolean => {
  if (candidate.epoch !== current.epoch) {
    return candidate.epoch > current.epoch;
  }
  if (candidate.hostId !== current.hostId) {
    return candidate.hostId < current.hostId;
  }
  return true;
};
