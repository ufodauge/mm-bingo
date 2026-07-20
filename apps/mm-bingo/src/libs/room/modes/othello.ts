import { BOARD_SIZE } from "../../../features/store/board";
import type { RoomState } from "../types";
import type { GameModeStrategy } from "./types";

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

const toRowCol = (index: number): [number, number] => [
  Math.floor(index / BOARD_SIZE),
  index % BOARD_SIZE,
];
const toIndex = (row: number, col: number): number => row * BOARD_SIZE + col;
const inBounds = (row: number, col: number): boolean =>
  row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

// Any cell that isn't the claiming team's own color gets flipped, as long as
// a line of such cells is bounded by an own-color cell (a "sandwich"). If
// the line instead hits an unclaimed cell or the board edge first, nothing
// in that direction flips.
const cellsToFlip = (
  state: RoomState,
  cellIndex: number,
  teamId: string,
): number[] => {
  const [row, col] = toRowCol(cellIndex);
  const flips: number[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const lineFlips: number[] = [];
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      const idx = toIndex(r, c);
      // othello's claimSharing is always forced to "exclusive" (see
      // withMode/withClaimSharing), so this is guaranteed length <= 1 —
      // the flip algorithm still only ever reasons about a single owner.
      const owner = state.cellClaims[idx][0] ?? null;
      if (owner === null) {
        break;
      }
      if (owner === teamId) {
        flips.push(...lineFlips);
        break;
      }
      lineFlips.push(idx);
      r += dr;
      c += dc;
    }
  }

  return flips;
};

export const othelloMode: GameModeStrategy = {
  initialRevealedCells: () => "all",
  // Exclusivity is guaranteed at the state level (claimSharing is always
  // forced "exclusive" for othello), so the cross-cutting sharing check in
  // withClaimAttempt already rejects a second claimant before this runs.
  canClaim: () => true,
  applyClaim: (state, cellIndex, teamId) => {
    const flips = cellsToFlip(state, cellIndex, teamId);
    const cellClaims = [cellIndex, ...flips].reduce(
      (claims, idx) => claims.with(idx, [teamId]),
      state.cellClaims,
    );
    return { ...state, cellClaims };
  },
  // Undoing a flip cascade is out of scope — see GameModeStrategy's comment.
  supportsUnclaim: false,
};
