import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  postRoomAction,
  replyRoomIdentity,
  requestRoomIdentity,
  subscribeRoomActions,
  subscribeRoomIdentity,
  subscribeRoomIdentityRequests,
  type RoomAction,
} from "./roomActionChannel";

const ORIGIN = "http://localhost:5183";

// The vitest environment here is plain Node, with no real `window` — this
// stub only needs to cover what roomActionChannel.ts actually touches
// (opener.postMessage, location.origin, and a minimal message-listener
// registry) to exercise the real module code against a fake same-origin
// "opener".
const makeWindowStub = () => {
  const listeners = new Map<string, Set<(event: unknown) => void>>();
  return {
    location: { origin: ORIGIN },
    opener: null as { postMessage: ReturnType<typeof vi.fn> } | null,
    addEventListener: (type: string, listener: (event: unknown) => void) => {
      (listeners.get(type) ?? listeners.set(type, new Set()).get(type)!).add(
        listener,
      );
    },
    removeEventListener: (type: string, listener: (event: unknown) => void) => {
      listeners.get(type)?.delete(listener);
    },
    dispatch: (type: string, event: unknown) => {
      for (const listener of listeners.get(type) ?? []) {
        listener(event);
      }
    },
  };
};

describe("postRoomAction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a tagged envelope to window.opener, scoped to this origin", () => {
    const postMessage = vi.fn();
    const win = makeWindowStub();
    win.opener = { postMessage };
    vi.stubGlobal("window", win);

    const action: RoomAction = { type: "claim-cell", cellIndex: 3 };
    postRoomAction(action);

    expect(postMessage).toHaveBeenCalledWith(
      { source: "ufodauge/mm-bingo/room-action", action },
      ORIGIN,
    );
  });

  it("is a no-op when there's no opener (not actually a popup, or it's gone)", () => {
    const win = makeWindowStub();
    vi.stubGlobal("window", win);

    expect(() =>
      postRoomAction({ type: "claim-cell", cellIndex: 0 }),
    ).not.toThrow();
  });
});

describe("subscribeRoomActions", () => {
  let win: ReturnType<typeof makeWindowStub>;

  beforeEach(() => {
    win = makeWindowStub();
    vi.stubGlobal("window", win);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("invokes onAction for a same-origin, correctly-tagged message", () => {
    const onAction = vi.fn();
    subscribeRoomActions(onAction);
    const action: RoomAction = { type: "unclaim-cell", cellIndex: 2 };

    win.dispatch("message", {
      origin: ORIGIN,
      data: { source: "ufodauge/mm-bingo/room-action", action },
    });

    expect(onAction).toHaveBeenCalledWith(action);
  });

  // The whole point of switching away from a same-origin BroadcastChannel
  // (see this file's own comment) — a message meant for a *different*
  // opener tab must not be picked up here just because both happen to be
  // open in the same browser.
  it("ignores messages from a different origin", () => {
    const onAction = vi.fn();
    subscribeRoomActions(onAction);

    win.dispatch("message", {
      origin: "https://evil.example",
      data: {
        source: "ufodauge/mm-bingo/room-action",
        action: { type: "claim-cell", cellIndex: 0 },
      },
    });

    expect(onAction).not.toHaveBeenCalled();
  });

  it("ignores same-origin messages that aren't tagged as a room action", () => {
    const onAction = vi.fn();
    subscribeRoomActions(onAction);

    win.dispatch("message", { origin: ORIGIN, data: { some: "unrelated" } });

    expect(onAction).not.toHaveBeenCalled();
  });

  it("stops listening once unsubscribed", () => {
    const onAction = vi.fn();
    const unsubscribe = subscribeRoomActions(onAction);
    unsubscribe();

    win.dispatch("message", {
      origin: ORIGIN,
      data: {
        source: "ufodauge/mm-bingo/room-action",
        action: { type: "claim-cell", cellIndex: 0 },
      },
    });

    expect(onAction).not.toHaveBeenCalled();
  });
});

describe("requestRoomIdentity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a request to window.opener", () => {
    const postMessage = vi.fn();
    const win = makeWindowStub();
    win.opener = { postMessage };
    vi.stubGlobal("window", win);

    requestRoomIdentity();

    expect(postMessage).toHaveBeenCalledWith(
      { source: "ufodauge/mm-bingo/room-identity-request" },
      ORIGIN,
    );
  });

  it("is a no-op when there's no opener", () => {
    const win = makeWindowStub();
    vi.stubGlobal("window", win);

    expect(() => requestRoomIdentity()).not.toThrow();
  });
});

describe("subscribeRoomIdentityRequests", () => {
  let win: ReturnType<typeof makeWindowStub>;

  beforeEach(() => {
    win = makeWindowStub();
    vi.stubGlobal("window", win);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes the sender (event.source) through to onRequest", () => {
    const onRequest = vi.fn();
    subscribeRoomIdentityRequests(onRequest);
    const fakePopup = { postMessage: vi.fn() };

    win.dispatch("message", {
      origin: ORIGIN,
      source: fakePopup,
      data: { source: "ufodauge/mm-bingo/room-identity-request" },
    });

    expect(onRequest).toHaveBeenCalledWith(fakePopup);
  });

  it("ignores a request with no event.source", () => {
    const onRequest = vi.fn();
    subscribeRoomIdentityRequests(onRequest);

    win.dispatch("message", {
      origin: ORIGIN,
      source: null,
      data: { source: "ufodauge/mm-bingo/room-identity-request" },
    });

    expect(onRequest).not.toHaveBeenCalled();
  });

  it("ignores same-origin messages that aren't identity requests", () => {
    const onRequest = vi.fn();
    subscribeRoomIdentityRequests(onRequest);

    win.dispatch("message", {
      origin: ORIGIN,
      source: { postMessage: vi.fn() },
      data: { some: "unrelated" },
    });

    expect(onRequest).not.toHaveBeenCalled();
  });
});

describe("replyRoomIdentity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the identity to the given target, scoped to this origin", () => {
    const win = makeWindowStub();
    vi.stubGlobal("window", win);
    const target = { postMessage: vi.fn() };

    replyRoomIdentity(target as unknown as MessageEventSource, {
      peerId: "peer-1",
      role: "host",
    });

    expect(target.postMessage).toHaveBeenCalledWith(
      {
        source: "ufodauge/mm-bingo/room-identity",
        identity: { peerId: "peer-1", role: "host" },
      },
      ORIGIN,
    );
  });

  it("can reply with null (not in a room)", () => {
    const win = makeWindowStub();
    vi.stubGlobal("window", win);
    const target = { postMessage: vi.fn() };

    replyRoomIdentity(target as unknown as MessageEventSource, null);

    expect(target.postMessage).toHaveBeenCalledWith(
      { source: "ufodauge/mm-bingo/room-identity", identity: null },
      ORIGIN,
    );
  });
});

describe("subscribeRoomIdentity", () => {
  let win: ReturnType<typeof makeWindowStub>;
  let opener: { postMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    win = makeWindowStub();
    opener = { postMessage: vi.fn() };
    win.opener = opener;
    vi.stubGlobal("window", win);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("invokes onIdentity for a reply from window.opener", () => {
    const onIdentity = vi.fn();
    subscribeRoomIdentity(onIdentity);
    const identity = { peerId: "peer-1", role: "host" as const };

    win.dispatch("message", {
      origin: ORIGIN,
      source: opener,
      data: { source: "ufodauge/mm-bingo/room-identity", identity },
    });

    expect(onIdentity).toHaveBeenCalledWith(identity);
  });

  // The whole point of this channel: this popup's own opener only, not
  // some other live tab that also happens to be broadcasting identity
  // updates (see roomActionChannel's own comment on why one shared
  // localStorage value can't tell those apart).
  it("ignores a same-shaped message from a source that isn't window.opener", () => {
    const onIdentity = vi.fn();
    subscribeRoomIdentity(onIdentity);

    win.dispatch("message", {
      origin: ORIGIN,
      source: { postMessage: vi.fn() },
      data: {
        source: "ufodauge/mm-bingo/room-identity",
        identity: { peerId: "someone-else", role: "host" },
      },
    });

    expect(onIdentity).not.toHaveBeenCalled();
  });

  it("ignores messages from a different origin", () => {
    const onIdentity = vi.fn();
    subscribeRoomIdentity(onIdentity);

    win.dispatch("message", {
      origin: "https://evil.example",
      source: opener,
      data: {
        source: "ufodauge/mm-bingo/room-identity",
        identity: { peerId: "peer-1", role: "host" },
      },
    });

    expect(onIdentity).not.toHaveBeenCalled();
  });
});
