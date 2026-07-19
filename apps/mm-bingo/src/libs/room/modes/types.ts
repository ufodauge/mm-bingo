import type { RoomState } from "../types";

export type GameModeStrategy = {
  initialRevealedCells: (cellsCount: number) => number[] | "all";
  canClaim: (state: RoomState, cellIndex: number) => boolean;
  applyClaim: (
    state: RoomState,
    cellIndex: number,
    teamId: string,
  ) => RoomState;
  // false only for othello — undoing a flip cascade is out of scope, so a
  // guest can never un-claim there; the host's unconditional override
  // (withTeamClaim) remains the only way to change an already-decided
  // othello cell. Every other mode allows a team to freely un-claim its
  // own claim.
  supportsUnclaim: boolean;
};
