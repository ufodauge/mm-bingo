import type { RoomRole } from "./roomSession";
import type { PeerId } from "./types";

// A popup window never holds a live RoomSession of its own (see
// roomConnectionAtom's comment in features/store/room.ts) — a cell action
// requested there has to reach whichever window actually does: postRoomAction
// is the popup side, subscribeRoomActions (see useRoomActionRelay) is the
// connected window applying it as if it had been clicked there directly.
//
// Targeted at window.opener specifically (every popup here is opened via a
// plain window.open() — see PopupButton — with no `noopener` and no COOP
// header narrowing it, so opener is always the exact tab that created it),
// not broadcast to every same-origin window: a same-origin BroadcastChannel
// used to serve this instead, but that reaches *every* window with a live
// connection, not just this popup's own opener. With only ever one such
// window that mostly didn't matter, but two independently-connected tabs
// open at once (host in one, guest in another — see reconnectToRoomAtom's
// "resume hosting" case) both received and independently applied the same
// action, and the outcome came down to timing. window.opener has no such
// ambiguity: there is exactly one.
//
// The identity request/reply pair below exists for the same reason, one
// level up: roomIdentityAtom (features/store/room.ts) is shared/mirrored
// across every same-origin tab, so it can only ever reflect ONE tab's
// identity at a time — with a host tab and a guest tab both live at once, a
// popup reading that shared atom directly sees whichever one wrote last,
// regardless of which tab actually opened it (see useRoomIdentity, which
// popup-facing code should use instead of roomIdentityAtom directly). A
// popup asks its own opener once on mount; the opener replies via
// event.source (it never tracked which popups exist, so this is the only
// handle it gets) and keeps pushing again on every later identity change —
// see useRoomActionRelay, which remembers requesters across those changes.
const ACTION_MESSAGE_SOURCE = "ufodauge/mm-bingo/room-action";
const IDENTITY_REQUEST_SOURCE = "ufodauge/mm-bingo/room-identity-request";
const IDENTITY_MESSAGE_SOURCE = "ufodauge/mm-bingo/room-identity";

export type RoomAction =
  | { type: "claim-cell"; cellIndex: number }
  | { type: "unclaim-cell"; cellIndex: number }
  | {
      type: "set-team-claim";
      cellIndex: number;
      teamId: string;
      claimed: boolean;
    }
  | { type: "clear-cell-claims"; cellIndex: number }
  | { type: "set-my-memo"; cellIndex: number; emoji: string | null }
  | {
      type: "set-team-memo";
      cellIndex: number;
      teamId: string;
      emoji: string | null;
    };

type RoomActionMessage = {
  source: typeof ACTION_MESSAGE_SOURCE;
  action: RoomAction;
};

// No-op if `window.opener` is gone (closed, or this isn't actually a
// popup) — same as before, when nobody was listening on the broadcast
// channel either.
export const postRoomAction = (action: RoomAction): void => {
  const message: RoomActionMessage = { source: ACTION_MESSAGE_SOURCE, action };
  window.opener?.postMessage(message, window.location.origin);
};

export const subscribeRoomActions = (
  onAction: (action: RoomAction) => void,
): (() => void) => {
  const listener = (event: MessageEvent<unknown>) => {
    // Same-origin popups only (see this file's own comment on why that's
    // guaranteed on the sending side) — checked again here anyway, since
    // `window` also receives `message` events from unrelated sources (e.g.
    // browser extensions) that happen to share this window's event target.
    if (event.origin !== window.location.origin) {
      return;
    }
    const data = event.data as Partial<RoomActionMessage> | null;
    if (data?.source !== ACTION_MESSAGE_SOURCE) {
      return;
    }
    onAction(data.action as RoomAction);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
};

export type RoomIdentitySnapshot = { peerId: PeerId; role: RoomRole } | null;

type IdentityRequestMessage = { source: typeof IDENTITY_REQUEST_SOURCE };
type IdentityMessage = {
  source: typeof IDENTITY_MESSAGE_SOURCE;
  identity: RoomIdentitySnapshot;
};

// Popup side, called once on mount (see useRoomIdentity) — no-op under the
// same conditions postRoomAction is (no opener, or it's gone).
export const requestRoomIdentity = (): void => {
  const message: IdentityRequestMessage = { source: IDENTITY_REQUEST_SOURCE };
  window.opener?.postMessage(message, window.location.origin);
};

// Opener side. `target` is a request's own `event.source`, not
// `window.opener` — the opener has no reference to its popups otherwise
// (see this file's own top comment). `MessageEventSource` also covers
// MessagePort/ServiceWorker, whose `postMessage` doesn't take a
// targetOrigin the way Window's does — never actually reached here, since
// every sender in this app is a same-origin popup Window, but TS still
// needs the cast to allow the call.
export const replyRoomIdentity = (
  target: MessageEventSource,
  identity: RoomIdentitySnapshot,
): void => {
  const message: IdentityMessage = { source: IDENTITY_MESSAGE_SOURCE, identity };
  (target as Window).postMessage(message, window.location.origin);
};

// Opener side: notified once per popup that's ever asked "what's my
// identity" — the caller (useRoomActionRelay) is expected to remember each
// `respondTo` and call replyRoomIdentity again on every later identity
// change, not just here.
export const subscribeRoomIdentityRequests = (
  onRequest: (respondTo: MessageEventSource) => void,
): (() => void) => {
  const listener = (event: MessageEvent<unknown>) => {
    if (event.origin !== window.location.origin || !event.source) {
      return;
    }
    const data = event.data as Partial<IdentityRequestMessage> | null;
    if (data?.source !== IDENTITY_REQUEST_SOURCE) {
      return;
    }
    onRequest(event.source);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
};

// Popup side: the opener's reply to this popup's own request, and every
// later push as the opener's identity changes (e.g. a host handover while
// the popup is still open) — checked against `window.opener` specifically
// (not just same-origin) so a message from some *other* live tab can't be
// mistaken for this popup's own opener answering.
export const subscribeRoomIdentity = (
  onIdentity: (identity: RoomIdentitySnapshot) => void,
): (() => void) => {
  const listener = (event: MessageEvent<unknown>) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== window.opener
    ) {
      return;
    }
    const data = event.data as Partial<IdentityMessage> | null;
    if (data?.source !== IDENTITY_MESSAGE_SOURCE) {
      return;
    }
    onIdentity(data.identity ?? null);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
};
