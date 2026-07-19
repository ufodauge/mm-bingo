import type { RoomState } from "../../libs/room/types";
import { CELLS_COUNT } from "../store/board";

// Converts a room's final team claims into the same shape as
// `colorIndicesAtom` (0 = unmarked, 1..N = index into this window's own
// marker colors), so the result survives after the room closes. Team
// colors are built 1:1 from the local marker colors at room-creation time
// (see buildTeamsFromMarkerColors), so a team's position in `state.teams`
// is exactly the marker-color index it should map back to.
//
// A cell can now have more than one claiming team (see cellClaims), but
// `colorIndices` is still a single index per cell — this only ever runs for
// the local peer transitioning back to solo view, so it prioritizes
// whichever claimant is *this peer's own team* (showing their own progress
// is the only sensible default), falling back to the first claimant when
// their own team never claimed the cell at all.
export const bakeRoomClaimsToColorIndices = (
  state: RoomState,
  myTeamId: string | null,
): number[] =>
  Array.from({ length: CELLS_COUNT }, (_, cellIndex) => {
    const claimants = state.cellClaims[cellIndex];
    if (claimants.length === 0) {
      return 0;
    }
    const teamId =
      myTeamId && claimants.includes(myTeamId) ? myTeamId : claimants[0];
    const teamIndex = state.teams.findIndex((team) => team.id === teamId);
    return teamIndex === -1 ? 0 : teamIndex + 1;
  });
