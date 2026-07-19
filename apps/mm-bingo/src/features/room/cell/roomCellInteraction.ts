import { postRoomAction } from "../../../libs/room/roomActionChannel";
import { MODE_STRATEGIES } from "../../../libs/room/roomStateTransitions";
import {
  effectiveClaimSharing,
  type RoomState,
  type Team,
} from "../../../libs/room/types";
import type { Cell } from "../../store/board";
import type { RoomConnection, RoomIdentity } from "../../store/room";
import type { CellInteraction } from "./useCellInteraction";

type Params = {
  cell: Cell;
  roomState: RoomState;
  connection: RoomConnection | undefined;
  identity: RoomIdentity | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

// The "inside a room" half of useCellInteraction — pulled out as a plain
// function (not a hook) specifically so it *can't* be called conditionally
// the way useCellInteraction's own two branches are chosen: it just
// computes a CellInteraction from already-resolved values, no hook rules
// to worry about.
export const computeRoomCellInteraction = ({
  cell,
  roomState,
  connection,
  identity,
  menuOpen,
  setMenuOpen,
}: Params): CellInteraction => {
  const claimants = roomState.cellClaims[cell.index];
  const memoMap = roomState.cellMemos[cell.index];
  const strategy = MODE_STRATEGIES[roomState.mode];
  // The mode's own rule-mandated reveal progress for this one cell (see
  // RoomState's own comment on revealedCells vs boardRevealed) — this is
  // what actually gates claim eligibility below, matching
  // withClaimAttempt's own gate exactly. Whether the cell's text is
  // actually *shown* to this viewer needs the host's curtain lifted too
  // (see textVisible).
  const ruleRevealed =
    roomState.revealedCells === "all" ||
    roomState.revealedCells.includes(cell.index);
  const textVisible = roomState.boardRevealed && ruleRevealed;
  // `identity` mirrors whichever window currently holds the live
  // RoomSession (see roomConnectionAtom) — reading it rather than
  // `connection` directly lets a popup window (which never holds a
  // RoomSession itself) still know it's a real participant, not just an
  // orphaned/read-only observer, and request actions via
  // roomActionChannel below instead of calling into a session it doesn't
  // have. It's cleared on unload (see useRoomActionRelay) so a
  // crashed/reloaded connection doesn't leave popups thinking someone is
  // still there to act on their behalf.
  const canAct = identity !== null;
  const isHost = identity?.role === "host";

  // RoomSession.peerId is this window's own peer id regardless of current
  // role (host or guest), so this stays correct even mid-promotion —
  // unlike deriving it from roomState.hostId, which briefly disagrees with
  // reality while a host handover is in flight.
  const myPeerId = identity?.peerId ?? null;
  const myTeamId =
    roomState.players.find((p) => p.peerId === myPeerId)?.teamId ?? null;
  const iAmClaiming = myTeamId !== null && claimants.includes(myTeamId);

  // The host is also the one who decides *when* the curtain lifts, so
  // letting them stake their own claims beforehand (via a plain click, not
  // just the override menu below) would be a conflict of interest — they
  // could sit on the reveal until their own picks look good. Applies to
  // every cell for as long as boardRevealed is false, regardless of mode
  // — see RoomState's own comment on boardRevealed for why this is a
  // curtain concern, not a per-mode one.
  const hostPreRevealLocked = isHost && !roomState.boardRevealed;

  // "hidden" mode gates claiming on its own rule-mandated reveal progress;
  // every other mode allows claiming from the start regardless (the
  // curtain, unlike revealedCells, never gates claim eligibility — see
  // RoomState's own comment on why). Deliberately checked against
  // ruleRevealed, not textVisible: claiming is allowed to work "blindly"
  // while the curtain's closed, same as it always could — only hidden
  // mode's own rule cares whether this specific cell's reveal progress has
  // reached it yet. Mirrors withClaimAttempt's own gate exactly, INCLUDING
  // the exclusive-mode "someone else already owns this" check — a cell
  // that looks claimable in the UI but would silently no-op on click is
  // exactly the class of bug already fixed once for the popup
  // orphaned-room case (see useRoomActionRelay); don't reintroduce it
  // here.
  const claimNeedsReveal = roomState.mode === "hidden";
  const canClaim =
    !hostPreRevealLocked &&
    (ruleRevealed || !claimNeedsReveal) &&
    !iAmClaiming &&
    canAct &&
    myTeamId !== null &&
    (effectiveClaimSharing(roomState) === "shared" || claimants.length === 0);
  const canUnclaim =
    !hostPreRevealLocked &&
    iAmClaiming &&
    canAct &&
    strategy.supportsUnclaim;
  const locked = !canClaim && !canUnclaim;

  // While the curtain's closed, a claim is only shown to its own team (so
  // you can track your own progress) — everyone else sees an empty cell
  // until the host reveals the board. Purely a boardRevealed concern, not
  // per-cell: unlike textVisible, this doesn't also need ruleRevealed —
  // a cell hidden mode hasn't revealed yet can't have a claimant at all
  // (canClaim above already blocks that), so there's nothing for
  // ruleRevealed to filter out here that isn't already empty.
  const visibleClaimants = roomState.boardRevealed
    ? claimants
    : claimants.filter((id) => id === myTeamId);
  const primaryId =
    myTeamId && visibleClaimants.includes(myTeamId)
      ? myTeamId
      : (visibleClaimants[0] ?? null);
  const primaryTeam = roomState.teams.find((t) => t.id === primaryId);
  const otherClaimants = visibleClaimants
    .filter((id) => id !== primaryId)
    .map((id) => roomState.teams.find((t) => t.id === id))
    .filter((t): t is Team => !!t);

  // The memo badge always shows MY OWN team's memo, never another team's —
  // team-shared (any teammate sees the same one), not room-wide, and this
  // is the one place that scoping is enforced (the underlying state has
  // every team's memo, since the host's menu can view/edit all of them).
  const memo = myTeamId ? memoMap[myTeamId] : undefined;

  const claimCell = () => {
    if (connection) {
      connection.session.claimCell(cell.index);
      return;
    }
    postRoomAction({ type: "claim-cell", cellIndex: cell.index });
  };
  const unclaimCell = () => {
    if (connection) {
      connection.session.unclaimCell(cell.index);
      return;
    }
    postRoomAction({ type: "unclaim-cell", cellIndex: cell.index });
  };
  const setTeamClaim = (teamId: string, claimed: boolean) => {
    if (connection) {
      connection.session.setTeamClaim(cell.index, teamId, claimed);
      return;
    }
    postRoomAction({
      type: "set-team-claim",
      cellIndex: cell.index,
      teamId,
      claimed,
    });
  };
  const clearCellClaims = () => {
    if (connection) {
      connection.session.clearCellClaims(cell.index);
      return;
    }
    postRoomAction({ type: "clear-cell-claims", cellIndex: cell.index });
  };
  // `RoomSession`/`postRoomAction` need `null` for "clear" — that boundary
  // crosses the wire (peer-to-host message) or the same-device
  // BroadcastChannel relay, both of which need an explicit, serializable
  // "no value" the way `undefined` isn't guaranteed to survive — see
  // PeerToHostMessage/RoomAction. Everywhere on this side of that boundary
  // (the UI-facing CellMemoRow/CellInteraction types) stays `undefined`.
  const setMyMemo = (emoji: string | undefined) => {
    if (connection) {
      connection.session.setMyMemo(cell.index, emoji ?? null);
      return;
    }
    postRoomAction({
      type: "set-my-memo",
      cellIndex: cell.index,
      emoji: emoji ?? null,
    });
  };
  const setTeamMemo = (teamId: string, emoji: string | undefined) => {
    if (connection) {
      connection.session.setTeamMemo(cell.index, teamId, emoji ?? null);
      return;
    }
    postRoomAction({
      type: "set-team-memo",
      cellIndex: cell.index,
      teamId,
      emoji: emoji ?? null,
    });
  };

  return {
    activeColor: primaryTeam ? primaryTeam.color : "var(--color-base-100)",
    locked,
    textVisible,
    otherClaimants,
    memo,
    onClick: () => {
      if (canClaim) {
        claimCell();
        return;
      }
      if (canUnclaim) {
        unclaimCell();
      }
    },
    // Available to guests now too, not host-exclusive — a guest's menu
    // just has fewer/disabled rows than the host's (see below).
    onContextMenu: (e) => {
      e.preventDefault();
      if (!canAct) {
        return;
      }
      setMenuOpen(true);
    },
    claimMenu:
      menuOpen && canAct
        ? {
            rows: roomState.teams.map((team) => {
              const claimed = claimants.includes(team.id);
              const isMine = team.id === myTeamId;
              const onToggle = isHost
                ? hostPreRevealLocked
                  ? undefined
                  : () => setTeamClaim(team.id, !claimed)
                : isMine && (claimed ? canUnclaim : canClaim)
                  ? () => (claimed ? unclaimCell() : claimCell())
                  : undefined;
              return { team, claimed, onToggle };
            }),
            onClearAll:
              isHost && !hostPreRevealLocked ? clearCellClaims : undefined,
            // Memo is cosmetic, not part of the curtain's suspense mechanic
            // — never gated by hostPreRevealLocked.
            memoRows: isHost
              ? roomState.teams.map((team) => ({
                  team,
                  value: memoMap[team.id],
                  onChange: (emoji: string | undefined) =>
                    setTeamMemo(team.id, emoji),
                }))
              : myTeamId
                ? (() => {
                    const myTeam = roomState.teams.find(
                      (t) => t.id === myTeamId,
                    );
                    return myTeam
                      ? [{ team: myTeam, value: memo, onChange: setMyMemo }]
                      : [];
                  })()
                : [],
            onClose: () => setMenuOpen(false),
          }
        : undefined,
  };
};
