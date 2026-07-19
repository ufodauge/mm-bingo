// Vitest auto-mock for the `trystero` package (picked up via `vi.mock("trystero")`
// per the jest/vitest __mocks__ convention — see roomSession.test.ts).
//
// Simulates the subset of Trystero's Room API that RoomSession actually uses
// (makeAction/onMessage/send, onPeerJoin/onPeerLeave, leave) as an in-memory
// full-mesh network keyed by roomId, so multiple RoomSession instances in the
// same test can exchange messages exactly like separate browser windows do
// over the real Nostr relay.
//
// `selfId` is a live `let` binding (not a function) because RoomSession reads
// it directly as `= selfId` in a field initializer and in its static
// host()/join() factories — mirroring how each real browser window gets its
// own fixed identity, __setSelfId lets each simulated "window" in a test
// claim a distinct one right before constructing its RoomSession.

type Listener = (data: unknown, context: { peerId: string }) => void;

type PeerEntry = {
  peerId: string;
  actions: Map<string, Listener | null>;
  onPeerJoin: ((peerId: string) => void) | null;
  onPeerLeave: ((peerId: string) => void) | null;
};

const networks = new Map<string, PeerEntry[]>();

export let selfId = "peer-0";

export const __setSelfId = (id: string): void => {
  selfId = id;
};

// Call from `beforeEach` to isolate tests from each other.
export const __resetTrysteroNetwork = (): void => {
  networks.clear();
  selfId = "peer-0";
};

const resolveTargets = (
  peers: PeerEntry[],
  selfPeerId: string,
  target: string | string[] | null | undefined,
): PeerEntry[] => {
  if (target === undefined || target === null) {
    return peers.filter((p) => p.peerId !== selfPeerId);
  }
  const ids = Array.isArray(target) ? target : [target];
  return peers.filter((p) => ids.includes(p.peerId));
};

export const joinRoom = (
  _config: unknown,
  roomId: string,
): {
  makeAction: (namespace: string) => {
    onMessage: Listener | null;
    send: (
      data: unknown,
      options?: { target?: string | string[] | null },
    ) => Promise<void>;
  };
  leave: () => Promise<void>;
  onPeerJoin: ((peerId: string) => void) | null;
  onPeerLeave: ((peerId: string) => void) | null;
} => {
  const peerId = selfId;
  const entry: PeerEntry = {
    peerId,
    actions: new Map(),
    onPeerJoin: null,
    onPeerLeave: null,
  };

  const peers = networks.get(roomId) ?? [];
  networks.set(roomId, peers);
  const others = [...peers];
  peers.push(entry);

  // Full-mesh discovery: every existing peer learns about the newcomer, and
  // the newcomer learns about every peer already there — matching real
  // Trystero, where every member is directly connected to every other.
  // Deferred to a microtask because RoomSession assigns `room.onPeerJoin`
  // only *after* this call returns (it needs the room object to do so) —
  // notifying synchronously here would fire before any handler exists to
  // receive it, same as real WebRTC handshakes never completing within the
  // same synchronous tick they were initiated in.
  queueMicrotask(() => {
    for (const other of others) {
      other.onPeerJoin?.(peerId);
      entry.onPeerJoin?.(other.peerId);
    }
  });

  let left = false;

  return {
    makeAction: (namespace: string) => ({
      get onMessage() {
        return entry.actions.get(namespace) ?? null;
      },
      set onMessage(fn: Listener | null) {
        entry.actions.set(namespace, fn);
      },
      send: async (data, options) => {
        if (left) {
          return;
        }
        const currentPeers = networks.get(roomId) ?? [];
        for (const target of resolveTargets(
          currentPeers,
          peerId,
          options?.target,
        )) {
          target.actions.get(namespace)?.(data, { peerId });
        }
      },
    }),
    leave: async () => {
      if (left) {
        return;
      }
      left = true;
      const currentPeers = networks.get(roomId);
      if (!currentPeers) {
        return;
      }
      const index = currentPeers.indexOf(entry);
      if (index !== -1) {
        currentPeers.splice(index, 1);
      }
      for (const other of currentPeers) {
        other.onPeerLeave?.(peerId);
      }
    },
    get onPeerJoin() {
      return entry.onPeerJoin;
    },
    set onPeerJoin(fn: ((peerId: string) => void) | null) {
      entry.onPeerJoin = fn;
    },
    get onPeerLeave() {
      return entry.onPeerLeave;
    },
    set onPeerLeave(fn: ((peerId: string) => void) | null) {
      entry.onPeerLeave = fn;
    },
  };
};
