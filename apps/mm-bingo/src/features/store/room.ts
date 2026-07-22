import { atom, type Getter } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { getCurrentQueryParams } from "../../libs/getCurrentQueryParams";
import type { RoomRole, RoomSession } from "../../libs/room/roomSession";
import type {
  ClaimSharing,
  GameModeId,
  PeerId,
  RevealSettings,
  RoomState,
} from "../../libs/room/types";
import { queryParamsAtom } from "./queryParams";
import { isTaskVersion, latestTaskVersion } from "./versions/taskVersion";

// A shared invite link's `?joinCode=...` should be consumed exactly once:
// read, and stripped from the URL so a later reload or navigation doesn't
// re-trigger the auto-fill/auto-open (see RoomButton/RoomDialog). This atom
// has no dependencies on other atoms (its body never calls `get`), so the
// store computes it once and caches the result forever — unlike a useState
// lazy initializer, which React's StrictMode deliberately double-invokes in
// dev to catch impure code (confirmed: instrumenting this and a lazy
// initializer with the same logic showed 1 call here vs. 4 there for the
// same page load). That makes it safe to do the one-time
// `history.replaceState` mutation right here: no matter how many times, or
// from how many components, `useAtomValue(joinCodeAtom)` is called, this
// body only actually runs once.
export const joinCodeAtom = atom(() => {
  const params = getCurrentQueryParams();
  const joinCode = params.get("joinCode");
  if (joinCode) {
    params.delete("joinCode");
    const query = params.toString();
    history.replaceState(
      history.state,
      "",
      `${document.location.pathname}${query ? `?${query}` : ""}`,
    );
  }
  return joinCode;
});

// True whenever this tab holds a live RoomConnection of its own — kept up
// to date from roomConnectionAtom's setter below. A plain module variable
// rather than something read via `get`, because it has to be readable
// synchronously from inside a browser `storage` event callback (see
// ignoringOtherLiveTabs), which runs outside any atom's get/set.
let hasLiveConnection = false;

// Wraps a plain JSON localStorage adapter so this tab ignores values that
// arrive from *other* same-origin tabs while it holds a live connection of
// its own. roomStateAtom/roomIdentityAtom's cross-tab mirroring exists for
// popup windows, which never hold a RoomSession (see roomConnectionAtom's
// comment) — but without this guard it also fires between two independent
// tabs that each have their own real, unrelated RoomSession (e.g. one
// hosting, one that joined a different room and then left): whichever
// tab's own room-state transition happens to write to localStorage last
// stomps every other live tab's view of its own connection, leaving it
// stuck showing "connecting" until its session happens to broadcast
// something new. A tab with no live connection of its own — a genuine
// popup, or this same tab before it's joined/hosted anything — still needs
// the mirror, so only tabs that actually have something of their own to
// protect skip incoming updates.
const ignoringOtherLiveTabs = <Value>() => {
  const base = createJSONStorage<Value>();
  return {
    ...base,
    subscribe: (
      key: string,
      callback: (value: Value) => void,
      initialValue: Value,
    ) =>
      base.subscribe?.(
        key,
        (value) => {
          if (!hasLiveConnection) {
            callback(value);
          }
        },
        initialValue,
      ),
  };
};

// Holds the last state received over WebRTC. Persisted via localStorage so
// that popup windows (which are separate windows/JS realms with no WebRTC
// connection of their own) pick up updates for free through the same
// `storage`-event mechanism `colorIndicesAtom` already relies on.
export const roomStateAtom = atomWithStorage<RoomState | null>(
  "ufodauge/mm-bingo/room-state",
  null,
  ignoringOtherLiveTabs(),
  { getOnInit: true },
);

// A genuinely dead room (every peer gone) can never be rejoined — there's
// no signaling server, and its roomId/invite code die with it (see
// RoomState's own comment on hostId/epoch). The closest thing to "returning"
// is starting a brand new hosting session pre-filled with whatever was last
// in use, so the host doesn't have to re-pick mode/claim-sharing/curtain
// settings from scratch every time. Updated on every synced RoomState (see
// applyRoomStateAtom), from either role, so it always reflects the most
// recent room regardless of whether this window was host or guest in it.
// Team colors/count need no equivalent here — markerColorsAtom (colors.ts)
// already persists independently of any room.
export const lastRoomSettingsAtom = atomWithStorage<{
  mode: GameModeId;
  claimSharing: ClaimSharing;
  revealSettings: RevealSettings;
} | null>("ufodauge/mm-bingo/last-room-settings", null);

// `role` is a live snapshot, not fixed for the connection's lifetime — a
// guest's RoomSession can promote itself to host after the previous host
// disconnects (see RoomSession.handlePeerLeave), at which point whatever
// wired up this atom's `onRoleChange` callback is expected to write the new
// role back in here, e.g. `setConnection((c) => c && { ...c, role })`.
export type RoomConnection = {
  role: RoomRole;
  session: RoomSession;
};

// The live session object itself is not serializable and only exists in the
// window that created/joined the room (never in popup windows). Never
// persisted/broadcast, so — unlike roomStateAtom/roomIdentityAtom — there's
// no JSON boundary requiring `null`; `undefined` is the "no connection"
// value throughout.
const roomConnectionPrimitiveAtom = atom<RoomConnection | undefined>(undefined);

export type RoomIdentity = { peerId: PeerId; role: RoomRole };

// A serializable projection of roomConnectionAtom, persisted so a popup
// window — which never holds the RoomSession itself — can still answer "am
// I in this room, and as host or guest" (see useCellInteraction/
// roomCellInteraction, which use this instead of roomConnectionAtom to
// decide whether a cell can be acted on, and useRoomActionRelay, which
// clears it on unload so a crashed/reloaded connection doesn't leave stale
// popups thinking someone is still listening).
export const roomIdentityAtom = atomWithStorage<RoomIdentity | null>(
  "ufodauge/mm-bingo/room-identity",
  null,
  ignoringOtherLiveTabs(),
);

// A tab-local record of the last peerId *this exact tab* used while
// connected — sessionStorage, not localStorage, specifically so it's never
// shared with other tabs the way roomStateAtom/roomIdentityAtom are. Kept
// past pagehide too (unlike roomIdentityAtom, see its own comment on why
// that one has to clear there), so it survives the reload it's meant to be
// read after. This is what lets reconnectToRoomAtom's "was I the solo
// host" check tell "this tab's own session just died" apart from "this tab
// never had a live connection to this room at all, it's only mirroring
// another live tab's roomStateAtom" — a real possibility now that
// ignoringOtherLiveTabs lets a connection-less tab freely mirror it: a
// mirrored solo-host snapshot looks identical to this tab's own, but only
// this tab's own sessionStorage copy could actually match its peerId.
export const lastOwnPeerIdAtom = atomWithStorage<PeerId | null>(
  "ufodauge/mm-bingo/last-own-peer-id",
  null,
  createJSONStorage<PeerId | null>(() => sessionStorage),
);

// The only place roomConnectionPrimitiveAtom is written — every caller goes
// through here (including the `set(roomConnectionAtom, (c) => ...)`
// functional form onRoomRoleChangeAtom uses for a role promotion) so
// roomIdentityAtom can never drift out of sync with the actual connection.
export const roomConnectionAtom = atom(
  (get) => get(roomConnectionPrimitiveAtom),
  (
    get,
    set,
    update:
      | RoomConnection
      | undefined
      | ((prev: RoomConnection | undefined) => RoomConnection | undefined),
  ) => {
    const next =
      typeof update === "function"
        ? update(get(roomConnectionPrimitiveAtom))
        : update;
    hasLiveConnection = next !== undefined;
    set(roomConnectionPrimitiveAtom, next);
    // roomIdentityAtom is persisted (localStorage via atomWithStorage), so
    // unlike `next` above it needs the JSON-safe `null` for "no identity",
    // not `undefined` — this is the one place that conversion happens.
    set(
      roomIdentityAtom,
      next ? { peerId: next.session.peerId, role: next.role } : null,
    );
    // Deliberately only written, never cleared, on disconnect — see
    // lastOwnPeerIdAtom's own comment on why it has to outlive the
    // connection that produced it.
    if (next) {
      set(lastOwnPeerIdAtom, next.session.peerId);
    }
  },
);

// roomConnectionAtom and roomStateAtom are independently-settable (they
// have to be — see roomConnectionAtom's own comment on why the live
// session can't be persisted the way roomState needs to be for popup
// windows), so nothing stops them from being read in any of the four
// combinations below. Every one of the four is actually meaningful (there
// really is a "just connecting, no state yet" phase, and a "state
// survived but the session that produced it didn't" orphaned phase), so
// this isn't about ruling any of them out — it's that RoomDialog and
// MainBoard each independently re-derived which of the four they were
// looking at (RoomDialog's own screen-selection ifs, MainBoard's
// `isRoomOrphaned`), two copies of the same four-way switch that could
// silently disagree if only one were ever updated. Deriving it once here
// means there's exactly one place that mapping lives.
export type RoomPhase =
  | { kind: "none" }
  | { kind: "connecting"; connection: RoomConnection }
  | { kind: "connected"; connection: RoomConnection; roomState: RoomState }
  | { kind: "orphaned"; roomState: RoomState };

export const roomPhaseAtom = atom((get): RoomPhase => {
  const connection = get(roomConnectionAtom);
  const roomState = get(roomStateAtom);
  if (connection && roomState) {
    return { kind: "connected", connection, roomState };
  }
  if (connection && !roomState) {
    return { kind: "connecting", connection };
  }
  if (!connection && roomState) {
    return { kind: "orphaned", roomState };
  }
  return { kind: "none" };
});

// Remembered across dialog opens/reloads so the user doesn't have to
// retype their name every time they host or join a room. `getOnInit` so an
// already-saved name is available synchronously on the very first render —
// RoomDialog's invite-link auto-join (see its own comment) reads this on
// mount and would otherwise always see the "" default first, indistinguishable
// from a genuinely unset name.
export const displayNameAtom = atomWithStorage<string>(
  "ufodauge/mm-bingo/room-display-name",
  "",
  undefined,
  { getOnInit: true },
);

// Picks which of RoomModeSection's two UIs the host sees: a single select
// of named presets (mode + claimSharing bundled together, e.g. "Lockout" =
// classic + exclusive) by default, or — once switched on here — the raw
// mode/claimSharing selects edited independently. A settings-level
// preference (see settings/RoomModeUiToggler.tsx), not room state: it's
// about how one particular host prefers to operate the picker, not
// something guests need to see or that should reset with the room.
export const advancedRoomModeAtom = atomWithStorage<boolean>(
  "ufodauge/mm-bingo/room-mode-advanced",
  false,
);

// Called from seedNumberAtom/taskVersionAtom's own write functions, right
// after they've written the new value through to `queryParamsAtom` — so a
// host's local edit reaches the room at the exact point it happens, instead
// of a useEffect watching for it to have changed on a later render.
export const pushBoardSettingsIfHosting = (get: Getter): void => {
  const connection = get(roomConnectionAtom);
  if (connection?.role !== "host") {
    return;
  }
  const status = get(queryParamsAtom);
  const versionRaw = status.version.toString();
  connection.session.updateBoardSettings({
    seed: status.seed,
    taskVersion: isTaskVersion(versionRaw) ? versionRaw : latestTaskVersion,
  });
};
