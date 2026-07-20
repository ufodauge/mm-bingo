import type { GameModeStrategy } from "./types";

// The "cell must not already be claimed by someone else" check now lives in
// withClaimAttempt (the cross-cutting exclusive/shared sharing policy,
// identical for every mode) — classic itself has no extra mode-specific
// gate beyond that, so this is unconditionally true.
export const canClaimClassic: GameModeStrategy["canClaim"] = () => true;

export const applyClaimClassic: GameModeStrategy["applyClaim"] = (
  state,
  cellIndex,
  teamId,
) => ({
  ...state,
  cellClaims: state.cellClaims.with(cellIndex, [
    ...state.cellClaims[cellIndex],
    teamId,
  ]),
});

export const classicMode: GameModeStrategy = {
  initialRevealedCells: () => "all",
  canClaim: canClaimClassic,
  applyClaim: applyClaimClassic,
  supportsUnclaim: true,
};
