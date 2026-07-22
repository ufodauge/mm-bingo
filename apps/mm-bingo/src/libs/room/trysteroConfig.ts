// A fixed namespace for this app's rooms on the public, decentralized
// network Trystero's default (Nostr) strategy uses for peer discovery/SDP
// exchange — there's no signaling server of our own to configure. Actual
// room-to-room isolation comes from each room's random roomId (generated
// in RoomSession.host), not from this constant; it only keeps this app's
// traffic from colliding with other unrelated Trystero apps using the same
// public relays.
export const TRYSTERO_APP_ID = "mm-bingo-room";

// Action IDs must match exactly across every peer to reach each other's
// handlers, so they're shared from one place rather than repeated as
// string literals throughout RoomSession.
export const PEER_TO_HOST_ACTION = "peer-to-host";
export const STATE_SYNC_ACTION = "state-sync";
// Host -> one specific guest only, never broadcast: see RoomSession's own
// comment on transferHostTo for why a voluntary handover needs its own
// channel instead of going through stateSync directly.
export const HOST_TRANSFER_ACTION = "host-transfer";

// Trystero's Nostr strategy picks its relay subset deterministically from
// its ~40 public defaults, seeded by a hash of `appId` (not randomized per
// session) — every peer of this app always lands on the exact same subset,
// which at the default redundancy (5) has consistently included
// relay.damus.io, a relay that rate-limits this app's traffic and can
// strand P2P discovery if it ends up being the only reachable one in a
// too-small subset. Widening the subset spreads discovery across more
// relays so one bad one doesn't take the whole app down with it.
export const TRYSTERO_RELAY_REDUNDANCY = 15;
