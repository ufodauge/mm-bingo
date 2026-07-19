import i18next from "i18next";
import { atom } from "jotai";

import type { RoomRole } from "../../libs/room/roomSession";
import { RoomSession } from "../../libs/room/roomSession";
import type { RoomState } from "../../libs/room/types";
import { markerColorsAtom } from "../store/colors/colors";
import { colorIndicesAtom } from "../store/colors/indices";
import { pushNotificationAtom } from "../store/notifications";
import { queryParamsAtom } from "../store/queryParams";
import {
  displayNameAtom,
  lastOwnPeerIdAtom,
  roomConnectionAtom,
  roomIdentityAtom,
  roomStateAtom,
} from "../store/room";
import { bakeRoomClaimsToColorIndices } from "./bakeRoomClaims";

// Shared by every path that can receive a RoomState off the wire (the
// normal host()/join() callbacks in RoomDialog, and reconnectToRoomAtom
// below) so the "a room configured to end on reveal is a one-shot session
// end" handling (see RoomState's own comment on endsRoomOnReveal) only
// needs to exist once. Lives in "features/room" rather than
// "features/store/room.ts" because it needs colorIndicesAtom — and
// store/room.ts is imported by features/store/colors/colors.ts, so pulling
// colorIndicesAtom's module in there (indices.ts also imports colors.ts)
// would create an import cycle.
export const applyRoomStateAtom = atom(null, (get, set, state: RoomState) => {
  // Every peer runs this on every incoming state (a normal host broadcast,
  // a handover winner's own emitState(), and every survivor's locally-
  // computed handover result — see RoomSession.handlePeerLeave) so this is
  // the one place that reliably sees a hostId change from any of them.
  // Comparing against the PREVIOUS roomState (not e.g. a separate `hostId`
  // ref) means a first-ever sync — where there's no earlier host to have
  // "changed" from — naturally doesn't fire: `previous` is null then, both
  // for a fresh join and right after reconnectToRoomAtom's own reset (see
  // its comment on why it clears roomStateAtom first).
  const previous = get(roomStateAtom);
  if (previous && previous.hostId !== state.hostId) {
    const myPeerId = get(roomIdentityAtom)?.peerId;
    const newHost = state.players.find((p) => p.peerId === state.hostId);
    set(
      pushNotificationAtom,
      state.hostId === myPeerId
        ? i18next.t("room.youBecameHost")
        : i18next.t("room.hostChanged", {
            name: newHost?.name ?? i18next.t("room.players.host"),
          }),
    );
  }

  // Mirrors RoomSession's own stateSync.onMessage check, for the same
  // reason: boardRevealed/endsRoomOnReveal are both freely settable
  // post-creation now (see RoomState's own comment), so this has to be an
  // *actual* false-to-true transition on boardRevealed, not just "both
  // happen to be true right now" — otherwise some later, unrelated update
  // (a rename, a claim) on a room where endsRoomOnReveal was switched on
  // after the curtain was already open would wrongly re-trigger this on
  // every peer.
  const justRevealed =
    previous && !previous.boardRevealed && state.boardRevealed;
  if (justRevealed && state.endsRoomOnReveal) {
    const myPeerId = get(roomIdentityAtom)?.peerId;
    const myTeamId =
      state.players.find((p) => p.peerId === myPeerId)?.teamId ?? null;
    set(colorIndicesAtom, bakeRoomClaimsToColorIndices(state, myTeamId));
    set(queryParamsAtom, { seed: state.seed, version: state.taskVersion });
    set(roomConnectionAtom, undefined);
    set(roomStateAtom, null);
    return;
  }
  set(roomStateAtom, state);
});

// markerColorsAtom (this window's own local, persisted color palette) and
// roomState.teams (the room's actual, network-authoritative team roster) are
// two independently-stored copies of "the same" list, kept in sync only by
// convention: useSetMarkerColors (colors.ts) mirrors every local edit
// through to the room *while this window already is the host* — but that
// says nothing about a window that becomes host mid-room via a handover
// (see withHostHandover), whose own markerColorsAtom was never touched and
// may not even be the same length as the roster it just inherited. Without
// this resync, that window's color editor would silently operate on the
// wrong array: same index, different (or nonexistent) team. Called from
// both places a window can end up hosting a room it didn't create itself
// (a live handover here, and RoomSession.resumeHosting via
// reconnectToRoomAtom below) — RoomSession.host() itself needs no such
// call, since roomState.teams there was already built FROM this window's
// current markerColorsAtom (see RoomDialog's buildTeamsFromMarkerColors).
const markerColorsFromRoomTeams = (roomState: RoomState): string[] =>
  roomState.teams.map((team) => team.color);

// Shared by every path that creates a RoomSession, so a role promotion is
// handled identically everywhere. seedNumberAtom/taskVersionAtom read
// straight from roomStateAtom while role is "guest" (see their own
// comments) and only switch to reading queryParamsAtom the instant role
// becomes "host" — but a promoted guest's queryParamsAtom was never written
// to while it was still just a guest, so without this sync it would
// suddenly show whatever stale seed/version this window happened to have
// before it ever joined the room, instead of the room's actual current
// one. (A brand new host via RoomSession.host() doesn't need this: its
// queryParamsAtom IS the source the initial RoomState was built from.)
export const onRoomRoleChangeAtom = atom(null, (get, set, role: RoomRole) => {
  if (role === "host") {
    const roomState = get(roomStateAtom);
    if (roomState) {
      set(queryParamsAtom, {
        seed: roomState.seed,
        version: roomState.taskVersion,
      });
      set(markerColorsAtom, markerColorsFromRoomTeams(roomState));
    }
  }
  set(roomConnectionAtom, (c) => (c ? { ...c, role } : c));
});

// Shared by every path that creates a RoomSession as a guest (fresh join
// in RoomDialog, and reconnectToRoomAtom below), wired up as
// RoomSessionCallbacks.onJoinTimeout — fires once a guest join/reconnect
// gives up waiting for a real stateSync (see JOIN_TIMEOUT_MS). The session
// itself has already torn down by the time this runs (RoomSession.leave()
// already ran internally), so this only needs to clean up the atom layer
// and let the player know why they're back in the pre-connect form instead
// of quietly leaving them to wonder. roomStateAtom needs no clearing here:
// both call sites already have it null by this point (a fresh join starts
// from no room at all, and reconnectToRoomAtom clears it up front — see its
// own comment on why).
export const onRoomJoinTimeoutAtom = atom(null, (_get, set) => {
  set(roomConnectionAtom, undefined);
  set(pushNotificationAtom, i18next.t("room.joinTimedOut"));
});

// A write-only atom for the "orphaned" case — `roomStateAtom` is non-null
// but `roomConnectionAtom` is already null, because THIS peer's own
// RoomSession object died (a reload or a crash — nothing to do with
// whether the room itself is still alive for everyone else; a surviving
// peer would already have taken over as host — see RoomSession's
// peer-leave handling). Carries the room's last known seed/version over to
// solo play, same as leaving normally, then clears the stale room state so
// the board unlocks. Offered alongside reconnectToRoomAtom below — this is
// the fallback for when the player doesn't want to (or can't) rejoin.
export const leaveOrphanedRoomAtom = atom(null, (get, set) => {
  const roomState = get(roomStateAtom);
  if (roomState) {
    set(queryParamsAtom, {
      seed: roomState.seed,
      version: roomState.taskVersion,
    });
  }
  set(roomStateAtom, null);
});

// The other half of the "orphaned" case: rejoin the same room fresh as a
// new peer, using the roomId still sitting in the stale roomState. Normally
// this is a *guest* rejoin even if this window was the host before — host
// authority already moved on the moment this peer's connection dropped, to
// whichever survivor was left (see RoomSession's peer-leave handling) — but
// if the stale state shows there was no survivor to hand off to (this peer
// was the only player, and it was already host), a guest rejoin here could
// only ever time out waiting for a host that no longer exists, so it
// resumes hosting instead (see RoomSession.resumeHosting).
export const reconnectToRoomAtom = atom(null, (get, set) => {
  const roomState = get(roomStateAtom);
  if (!roomState) {
    return;
  }
  const displayName = get(displayNameAtom);
  // Clear the stale state *before* creating the new session, not after:
  // RoomDialog decides which of its screens to show purely from
  // `connection && roomState` (see its own render logic), with no way to
  // tell "roomState carried over from before this reconnect" apart from "a
  // real, fresh sync from the new session". Leaving the old state in place
  // here made it show RoomConnectedPanel — a fully "connected" room, host
  // badge included — the instant this atom ran, built entirely from
  // pre-disconnect data the new session hasn't confirmed at all. If the
  // room no longer exists, no real sync ever arrives to correct it: the UI
  // is then stuck permanently "connected" to a room that's actually gone,
  // showing a stale host with no real authority over anyone (every
  // mutation from here silently goes nowhere — see RoomSession.join's
  // guest phase). Clearing first makes this reconnect behave exactly like
  // a first-time join: `connection && !roomState` shows RoomConnectingPanel
  // until (and unless) the new session actually hears back.
  set(roomStateAtom, null);

  // roomState.players showing just one player who's also the host isn't
  // enough on its own: since ignoringOtherLiveTabs lets a tab with no live
  // connection freely mirror another tab's roomStateAtom (see its own
  // comment), a *different*, merely-mirroring tab can see this exact same
  // snapshot. lastOwnPeerIdAtom is sessionStorage, never shared cross-tab,
  // so requiring the solo player's peerId to match it narrows this down to
  // "this tab's own session produced that snapshot" — the only case where
  // resuming hosting is actually this tab's call to make.
  const wasSoloHost =
    roomState.players.length === 1 &&
    roomState.players[0]?.peerId === roomState.hostId &&
    roomState.players[0]?.peerId === get(lastOwnPeerIdAtom);
  if (wasSoloHost) {
    const session = RoomSession.resumeHosting(
      roomState,
      displayName.trim() || "Host",
      {
        onStateChange: (state) => set(applyRoomStateAtom, state),
        onRoleChange: (role) => set(onRoomRoleChangeAtom, role),
      },
    );
    // See markerColorsFromRoomTeams' own comment: this path resumes hosting
    // straight from the persisted roomState rather than building teams from
    // this tab's CURRENT markerColorsAtom the way RoomSession.host() does,
    // so the two could in principle have drifted (e.g. another same-origin
    // tab edited the palette in between — see ignoringOtherLiveTabs).
    set(markerColorsAtom, markerColorsFromRoomTeams(roomState));
    set(roomConnectionAtom, { role: "host", session });
    return;
  }

  const session = RoomSession.join(
    displayName.trim() || "Guest",
    roomState.roomId,
    {
      onStateChange: (state) => set(applyRoomStateAtom, state),
      onRoleChange: (role) => set(onRoomRoleChangeAtom, role),
      onJoinTimeout: () => set(onRoomJoinTimeoutAtom),
    },
  );
  set(roomConnectionAtom, { role: "guest", session });
});
