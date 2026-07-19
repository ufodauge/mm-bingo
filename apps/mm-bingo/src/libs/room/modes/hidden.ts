import { BOARD_SIZE } from "../../../features/store/board";
import type { RoomState } from "../types";
import type { GameModeStrategy } from "./types";

const orthogonalNeighbors = (index: number): number[] => {
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]
    .filter(([r, c]) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE)
    .map(([r, c]) => r * BOARD_SIZE + c);
};

const isRevealed = (state: RoomState, cellIndex: number): boolean =>
  state.revealedCells === "all" || state.revealedCells.includes(cellIndex);

export const hiddenMode: GameModeStrategy = {
  initialRevealedCells: (cellsCount) => {
    const center = Math.floor(cellsCount / 2);
    return [center, ...orthogonalNeighbors(center)];
  },
  // Ownership exclusivity is handled by the cross-cutting sharing policy in
  // withClaimAttempt — this mode's only extra gate is the reveal check.
  canClaim: (state, cellIndex) => isRevealed(state, cellIndex),
  applyClaim: (state, cellIndex, teamId) => {
    const revealedCells =
      state.revealedCells === "all"
        ? "all"
        : [
            ...new Set([
              ...state.revealedCells,
              cellIndex,
              ...orthogonalNeighbors(cellIndex),
            ]),
          ];
    return {
      ...state,
      cellClaims: state.cellClaims.with(cellIndex, [
        ...state.cellClaims[cellIndex],
        teamId,
      ]),
      revealedCells,
    };
  },
  supportsUnclaim: true,
};
