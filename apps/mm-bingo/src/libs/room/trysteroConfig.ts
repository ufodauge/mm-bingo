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
