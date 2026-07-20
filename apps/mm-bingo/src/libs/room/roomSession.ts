import { joinRoom, selfId, type MessageAction, type Room } from "trystero";

import { CELLS_COUNT } from "../../features/store/board";
import {
  isStateNewer,
  MODE_STRATEGIES,
  withBoardRevealed,
  withBoardSettings,
  withClaimAttempt,
  withClaimSharing,
  withClearedCellClaims,
  withCurtain,
  withEndsRoomOnReveal,
  withHostHandover,
  withJoinRequest,
  withMode,
  withNewTeam,
  withOwnMemo,
  withoutPlayer,
  withoutTeamAt,
  withPlayerName,
  withPlayerTeam,
  withTeamClaim,
  withTeamColor,
  withTeamMemo,
  withUnclaimAttempt,
} from "./roomStateTransitions";
import {
  PEER_TO_HOST_ACTION,
  STATE_SYNC_ACTION,
  TRYSTERO_APP_ID,
  TRYSTERO_RELAY_REDUNDANCY,
} from "./trysteroConfig";
import type {
  BoardSettings,
  ClaimSharing,
  GameModeId,
  PeerId,
  PeerToHostMessage,
  RevealSettings,
  RoomState,
  Team,
} from "./types";

export type RoomRole = "host" | "guest";

// A guest with a genuinely dead room (nonexistent, or its last host is long
// gone with nobody to hand off to) sits with `phase.state === null` forever
// — nothing ever arrives to tell it otherwise, since there's no one there
// to send it (see stateSync.onMessage). Giving up after this long turns
// that silence into an actual answer instead of leaving the caller to wait
// on a "Connecting..." screen indefinitely.
//
// Deliberately generous rather than snappy: SDP exchange goes through
// Trystero's public Nostr relay pool (see trysteroConfig.ts), which is
// general-purpose social-network infrastructure, not dedicated signaling —
// individual relays intermittently rate-limit or lag under this app's
// announce traffic. A short timeout here turns that ordinary relay hiccup
// into a false "the room doesn't exist" for a guest whose host is actually
// up and reachable.
export const JOIN_TIMEOUT_MS = 15_000;

export type RoomSessionCallbacks = {
  onStateChange: (state: RoomState) => void;
  // Fired when this session's own role changes — today that only happens
  // via host handover (see handlePeerLeave), never on the way in (host()
  // and join() already know their starting role up front).
  onRoleChange: (role: RoomRole) => void;
  // Fired once, and only once, if a guest join/reconnect never receives a
  // real stateSync within JOIN_TIMEOUT_MS — see its own comment. The
  // session has already torn itself down (leave()) by the time this fires,
  // same as if the caller had called it directly. Never fires for a host
  // (already has state synchronously, see the constructor) or once any
  // state has actually arrived.
  onJoinTimeout?: () => void;
};

export type { BoardSettings };

// Everything that used to be three independently-mutable fields (`role`,
// `state`, `left`) collapsed into one. Those three were never actually
// independent — "left" made the other two meaningless, and "guest with no
// state yet" vs. "guest with state" vs. "host" (always has state) were the
// only combinations that ever occurred — but nothing in their types said
// so, so every method had to re-derive which combination it was looking at
// via its own ad hoc guard. Replacing the whole trio with one field means
// there's exactly one place a given combination can come from, and TS
// checks the rest: `phase.kind === "host"` alone is enough to know
// `phase.state` isn't null, with no separate `!this.state` check to
// remember.
type SessionPhase =
  | { readonly kind: "host"; readonly state: RoomState }
  | { readonly kind: "guest"; readonly state: RoomState | null }
  | { readonly kind: "left" };

// A single peer's session in a room. Every peer — whoever created the room
// and everyone who joined it — is an instance of this same class; "host"
// vs. "guest" is just a role this instance currently holds, not a
// different kind of object. That's what makes host handover possible: when
// the current host disconnects, a guest instance doesn't need to tear down
// and reconnect as a different class — it just starts satisfying the
// host-side responsibilities on the connection it already has open (see
// handlePeerLeave). Every peer in a Trystero room is already directly
// connected to every other peer (it's a full mesh, not actually a star at
// the network level — "host-authoritative" is purely an application-level
// convention), so a handover needs no renegotiation either.
//
// This class itself owns only the *networking and lifecycle* side: wiring
// up trystero, tracking which phase this peer is currently in, and routing
// each call/message to the right pure state transition (see
// roomStateTransitions.ts, where all the actual RoomState -> RoomState
// logic lives, independent of any of this).
export class RoomSession {
  readonly roomId: string;
  readonly peerId: PeerId = selfId;
  private readonly room: Room;
  private readonly peerToHost: MessageAction<PeerToHostMessage>;
  private readonly stateSync: MessageAction<RoomState>;
  private readonly callbacks: RoomSessionCallbacks;
  private phase: SessionPhase;
  private myName: string;
  private joinTimeoutId: ReturnType<typeof setTimeout> | undefined;

  private constructor(
    roomId: string,
    initialPhase: SessionPhase,
    myName: string,
    callbacks: RoomSessionCallbacks,
  ) {
    this.roomId = roomId;
    this.phase = initialPhase;
    this.myName = myName;
    this.callbacks = callbacks;
    this.room = joinRoom(
      {
        appId: TRYSTERO_APP_ID,
        relayConfig: { redundancy: TRYSTERO_RELAY_REDUNDANCY },
      },
      roomId,
    );

    this.peerToHost =
      this.room.makeAction<PeerToHostMessage>(PEER_TO_HOST_ACTION);
    this.stateSync = this.room.makeAction<RoomState>(STATE_SYNC_ACTION);

    this.peerToHost.onMessage = (message, { peerId }) => {
      if (this.phase.kind !== "host") {
        return;
      }
      this.handleMessage(peerId, message);
    };
    this.stateSync.onMessage = (incoming, { peerId: senderPeerId }) => {
      // Trystero hands every peer the same "state-sync" action — nothing
      // stops a non-host peer from calling send() on it directly with a
      // hand-crafted RoomState. isStateNewer() only looks at fields *inside*
      // that payload (epoch/hostId), so without this check any peer could
      // claim to be the host (self-assigned hostId, epoch bumped past the
      // real one) and every other peer would accept it — unlike
      // peerToHost.onMessage below, which already trusts Trystero's own
      // `peerId` from the message context, never a payload field, for
      // exactly this reason. Requiring the two to match here closes that
      // gap: a legitimate broadcast only ever comes from emitState(), where
      // `state.hostId` is always this session's own peerId (see
      // RoomSession.host/withHostHandover), so this rejects nothing real.
      if (senderPeerId !== incoming.hostId) {
        return;
      }
      const phase = this.phase;
      if (phase.kind === "left") {
        return;
      }
      if (phase.state && !isStateNewer(incoming, phase.state)) {
        return;
      }
      // Read before this.phase is overwritten below. boardRevealed/
      // endsRoomOnReveal are both freely settable post-creation now (see
      // RoomState's own comment), so a broadcast can carry both already
      // true without this being the moment it was actually revealed (e.g.
      // endsRoomOnReveal switched on after the curtain was already open) —
      // only an *actual* false-to-true transition on THIS peer's own view
      // of boardRevealed means "just now", so this must compare against
      // what this session already had, not just inspect the incoming
      // state on its own.
      const wasOpen = phase.state ? phase.state.boardRevealed : true;
      clearTimeout(this.joinTimeoutId);
      this.phase = { ...phase, state: incoming };
      this.callbacks.onStateChange(incoming);
      // Mirror revealBoard()/setBoardRevealed(): a room configured to end
      // on reveal (see RevealSettings.endsRoomOnReveal) has nothing left
      // to do the moment it's actually revealed, so every peer that hears
      // about it tears itself down too instead of waiting for the host
      // specifically.
      if (!wasOpen && incoming.boardRevealed && incoming.endsRoomOnReveal) {
        this.leave();
      }
    };
    // There's no way to tell which peer currently holds host authority up
    // front (Trystero treats every room member the same, and authority can
    // move after a handover anyway), so a non-host announces itself on
    // every newly seen peer rather than trying to guess. Whichever peer is
    // actually host ignores repeats from an already-known peer (see
    // withJoinRequest), and only the current host has a handler registered
    // for this action at all, so the extra sends to other guests are
    // harmless no-ops.
    this.room.onPeerJoin = () => {
      if (this.phase.kind !== "guest") {
        return;
      }
      void this.peerToHost.send({ type: "join-request", name: this.myName });
    };
    this.room.onPeerLeave = (peerId) => {
      if (this.phase.kind === "left") {
        return;
      }
      this.handlePeerLeave(peerId);
    };

    if (this.phase.kind === "host") {
      this.emitState();
    } else if (this.phase.kind === "guest") {
      this.joinTimeoutId = setTimeout(() => {
        this.joinTimeoutId = undefined;
        // Re-check rather than trusting the closure: by the time this
        // fires, stateSync.onMessage may already have cleared it (the
        // normal case) or handlePeerLeave may have moved this session
        // elsewhere entirely — only a guest that's still waiting counts as
        // a real timeout.
        if (this.phase.kind === "guest" && this.phase.state === null) {
          this.leave();
          this.callbacks.onJoinTimeout?.();
        }
      }, JOIN_TIMEOUT_MS);
    }
  }

  static host(
    hostName: string,
    teams: Team[],
    mode: GameModeId,
    claimSharing: ClaimSharing,
    // Room-creation-only choices for the boardRevealed curtain — see
    // RevealSettings' own comment on why these two are bundled, and
    // RoomState's own comment on boardRevealed/endsRoomOnReveal for what
    // each actually does afterward.
    revealSettings: RevealSettings,
    boardSettings: BoardSettings,
    callbacks: RoomSessionCallbacks,
  ): RoomSession {
    const roomId = crypto.randomUUID();
    // See RoomState's own comment on why "othello" gets no `claimSharing`
    // field at all here, regardless of what the caller passed in.
    const common = {
      roomId,
      hostId: selfId,
      epoch: 0,
      teams,
      players: [
        { peerId: selfId, name: hostName, teamId: teams[0]?.id ?? null },
      ],
      cellClaims: Array.from({ length: CELLS_COUNT }, () => []),
      cellMemos: Array.from({ length: CELLS_COUNT }, () => ({})),
      revealedCells: MODE_STRATEGIES[mode].initialRevealedCells(CELLS_COUNT),
      boardRevealed: !revealSettings.startHidden,
      endsRoomOnReveal: revealSettings.endsRoomOnReveal,
      seed: boardSettings.seed,
      taskVersion: boardSettings.taskVersion,
    };
    const initialState: RoomState =
      mode === "othello"
        ? { ...common, mode }
        : { ...common, mode, claimSharing };
    return new RoomSession(
      roomId,
      { kind: "host", state: initialState },
      hostName,
      callbacks,
    );
  }

  static join(
    guestName: string,
    roomId: string,
    callbacks: RoomSessionCallbacks,
  ): RoomSession {
    return new RoomSession(
      roomId,
      { kind: "guest", state: null },
      guestName,
      callbacks,
    );
  }

  // Resumes hosting the same room after this exact peer's own session died
  // (a reload or a crash) and came back — only valid to call when
  // `previousState` shows this peer was the sole remaining player and
  // already held host authority (see reconnectToRoomAtom's `wasSoloHost`
  // check): with nobody else left in the room, a guest rejoin could only
  // ever hit JOIN_TIMEOUT_MS waiting for a host that no longer exists, even
  // though the last living authority over this room was this same browser
  // a moment ago. `selfId` is a fresh value every page load (see the top of
  // this file), so — same as a real handover, see withHostHandover — hostId
  // and the sole player entry are rewritten to it and epoch is bumped,
  // rather than reusing the stale ones from `previousState`.
  static resumeHosting(
    previousState: RoomState,
    hostName: string,
    callbacks: RoomSessionCallbacks,
  ): RoomSession {
    const resumedState: RoomState = {
      ...previousState,
      hostId: selfId,
      epoch: previousState.epoch + 1,
      players: [
        {
          peerId: selfId,
          name: hostName,
          teamId: previousState.players[0]?.teamId ?? null,
        },
      ],
    };
    return new RoomSession(
      previousState.roomId,
      { kind: "host", state: resumedState },
      hostName,
      callbacks,
    );
  }

  setPlayerTeam(peerId: PeerId, teamId: string | null): void {
    this.updateHostState((state) => withPlayerTeam(state, peerId, teamId));
  }

  rename(name: string): void {
    if (this.phase.kind === "left") {
      return;
    }
    this.myName = name;
    if (this.phase.kind === "guest") {
      void this.peerToHost.send({ type: "rename", name });
      return;
    }
    this.updateHostState((state) => withPlayerName(state, this.peerId, name));
  }

  addTeam(color: string): void {
    this.updateHostState((state) => withNewTeam(state, color));
  }

  removeTeamAt(index: number): void {
    this.updateHostState((state) => withoutTeamAt(state, index));
  }

  updateTeamColor(index: number, color: string): void {
    this.updateHostState((state) => withTeamColor(state, index, color));
  }

  updateBoardSettings(boardSettings: BoardSettings): void {
    this.updateHostState((state) => withBoardSettings(state, boardSettings));
  }

  setMode(mode: GameModeId): void {
    this.updateHostState((state) => withMode(state, mode));
  }

  // Directly opens or closes the curtain, with no other side effect on
  // revealedCells — unlike revealBoard() below, this never finishes the
  // mode's own rule-mandated reveal progress. Lets a host run a curtain
  // round mid-room (e.g. re-close it after a mode/seed change already
  // reset the board anyway) without going through "reveal everything".
  // Opening it DOES still end the room if endsRoomOnReveal is on (see
  // endIfJustRevealed) — that setting means exactly "the next time the
  // curtain opens, however that happens", not "only via revealBoard()".
  setBoardRevealed(open: boolean): void {
    const wasOpen =
      this.phase.kind === "host" && this.phase.state.boardRevealed;
    this.updateHostState((state) => withCurtain(state, open));
    this.endIfJustRevealed(wasOpen);
  }

  // See RevealSettings' own comment on why this is independent of the
  // curtain itself — settable any time, not just at room creation. Never
  // itself ends the room (see endIfJustRevealed — only an actual
  // false-to-true transition on boardRevealed does that), so flipping this
  // on while the curtain's already open is a safe no-op until the next
  // time it's actually opened.
  setEndsRoomOnReveal(endsRoomOnReveal: boolean): void {
    this.updateHostState((state) =>
      withEndsRoomOnReveal(state, endsRoomOnReveal),
    );
  }

  // Reveals everything at once: finishes the current mode's own
  // rule-mandated reveal progress and lifts the boardRevealed curtain (see
  // withBoardRevealed, and RoomState's own comment on the two). Whether
  // that also ends the room — every peer falling back to solo play, the
  // final claims baked into their own board (see RoomDialog's
  // state-change handler) — is this room's own endsRoomOnReveal setting
  // (see RevealSettings), independent of whether it started hidden: a room
  // can start hidden and keep going once revealed (e.g. othello, which
  // needs the curtain open to be playable at all but has no reason to end
  // there).
  revealBoard(): void {
    const wasOpen =
      this.phase.kind === "host" && this.phase.state.boardRevealed;
    this.updateHostState(withBoardRevealed);
    this.endIfJustRevealed(wasOpen);
  }

  // Shared by setBoardRevealed/revealBoard, the only two actions that can
  // ever change boardRevealed: ends this session's own tenure (WebRTC
  // teardown included, not just the client-side atom cleanup
  // applyRoomStateAtom does on every peer independently — see its own
  // comment) the moment boardRevealed actually transitions false-to-true
  // while endsRoomOnReveal is on. `wasOpen` has to be captured by the
  // caller *before* calling updateHostState — by the time this runs, this
  // session's own state already reflects the new value, so there'd be
  // nothing left to compare against here.
  private endIfJustRevealed(wasOpen: boolean): void {
    if (
      !wasOpen &&
      this.phase.kind === "host" &&
      this.phase.state.boardRevealed &&
      this.phase.state.endsRoomOnReveal
    ) {
      this.leave();
    }
  }

  claimCell(cellIndex: number): void {
    if (this.phase.kind === "left") {
      return;
    }
    if (this.phase.kind === "host") {
      this.updateHostState((state) =>
        withClaimAttempt(state, this.peerId, cellIndex),
      );
      return;
    }
    void this.peerToHost.send({ type: "claim-cell", cellIndex });
  }

  // The new "undo my own claim" capability — mirrors claimCell exactly.
  // Silently a no-op wherever it doesn't apply (no team, already unclaimed,
  // or the current mode's supportsUnclaim is false — e.g. othello).
  unclaimCell(cellIndex: number): void {
    if (this.phase.kind === "left") {
      return;
    }
    if (this.phase.kind === "host") {
      this.updateHostState((state) =>
        withUnclaimAttempt(state, this.peerId, cellIndex),
      );
      return;
    }
    void this.peerToHost.send({ type: "unclaim-cell", cellIndex });
  }

  // Host-only unconditional per-team override (replaces the old
  // setCellClaim) — bypasses canClaim/mode rules entirely for any team,
  // including the host's own.
  setTeamClaim(cellIndex: number, teamId: string, claimed: boolean): void {
    this.updateHostState((state) =>
      withTeamClaim(state, cellIndex, teamId, claimed),
    );
  }

  // Host-only "clear every team's claim on this cell" quick action.
  clearCellClaims(cellIndex: number): void {
    this.updateHostState((state) => withClearedCellClaims(state, cellIndex));
  }

  // Sets/clears MY OWN team's memo on a cell — usable by host and guest
  // alike (mirrors claimCell's host/guest split), since memos are cosmetic
  // and never mode-gated.
  setMyMemo(cellIndex: number, emoji: string | null): void {
    if (this.phase.kind === "left") {
      return;
    }
    if (this.phase.kind === "host") {
      this.updateHostState((state) =>
        withOwnMemo(state, this.peerId, cellIndex, emoji),
      );
      return;
    }
    void this.peerToHost.send({ type: "set-memo", cellIndex, emoji });
  }

  // Host-only unconditional override for any team's memo (parallels
  // setTeamClaim).
  setTeamMemo(cellIndex: number, teamId: string, emoji: string | null): void {
    this.updateHostState((state) =>
      withTeamMemo(state, cellIndex, teamId, emoji),
    );
  }

  // Host-only. Forced back to "exclusive" if the room is currently in
  // othello mode — see withClaimSharing.
  setClaimSharing(claimSharing: ClaimSharing): void {
    this.updateHostState((state) => withClaimSharing(state, claimSharing));
  }

  leave(): void {
    clearTimeout(this.joinTimeoutId);
    this.phase = { kind: "left" };
    void this.room.leave();
  }

  private handleMessage(peerId: PeerId, message: PeerToHostMessage): void {
    switch (message.type) {
      case "join-request": {
        this.updateHostState((state) =>
          withJoinRequest(state, peerId, message.name),
        );
        return;
      }
      case "claim-cell": {
        this.updateHostState((state) =>
          withClaimAttempt(state, peerId, message.cellIndex),
        );
        return;
      }
      case "unclaim-cell": {
        this.updateHostState((state) =>
          withUnclaimAttempt(state, peerId, message.cellIndex),
        );
        return;
      }
      case "set-memo": {
        this.updateHostState((state) =>
          withOwnMemo(state, peerId, message.cellIndex, message.emoji),
        );
        return;
      }
      case "rename": {
        this.updateHostState((state) =>
          withPlayerName(state, peerId, message.name),
        );
        return;
      }
    }
  }

  private handlePeerLeave(peerId: PeerId): void {
    const phase = this.phase;
    if (phase.kind === "left") {
      return;
    }
    const state = phase.state;
    if (!state) {
      return;
    }

    if (peerId !== state.hostId) {
      // A regular (non-host) player departed — only the current host
      // removes them and broadcasts; other guests just wait for that
      // broadcast, same as for any other state change.
      if (phase.kind !== "host") {
        return;
      }
      this.updateHostState((s) => withoutPlayer(s, peerId));
      return;
    }

    // The host itself departed. See withHostHandover for how the successor
    // is chosen.
    const nextState = withHostHandover(state, peerId, this.peerId);

    if (nextState.hostId === this.peerId) {
      this.phase = { kind: "host", state: nextState };
      this.callbacks.onRoleChange("host");
      this.emitState();
      return;
    }

    // Not the winner — apply the same deterministic result locally right
    // away (every survivor computed the identical outcome, so this isn't a
    // guess) so the UI doesn't sit on a stale view while the actual
    // winner's broadcast is still in flight, then make sure the new host
    // actually knows about this peer: if this peer's own join-request
    // never reached the OLD host before it disappeared, it wouldn't be in
    // `players` at all, and the new host needs a fresh announcement to add
    // it (a harmless no-op resend otherwise, per the dedup in
    // withJoinRequest).
    this.phase = { ...phase, state: nextState };
    this.callbacks.onStateChange(nextState);
    void this.peerToHost.send({ type: "join-request", name: this.myName });
  }

  // Every host-only mutation goes through this single choke point:
  // `update` reads the current state and returns either the next state, or
  // `null` to signal "no actual change" (see roomStateTransitions.ts) — in
  // which case nothing is written or broadcast. Non-host phases are
  // silently a no-op, so callers never need their own separate "am I even
  // the host" guard.
  private updateHostState(
    update: (state: RoomState) => RoomState | null,
  ): void {
    if (this.phase.kind !== "host") {
      return;
    }
    const nextState = update(this.phase.state);
    if (!nextState) {
      return;
    }
    this.phase = { kind: "host", state: nextState };
    this.emitState();
  }

  private emitState(): void {
    if (this.phase.kind !== "host") {
      return;
    }
    this.callbacks.onStateChange(this.phase.state);
    void this.stateSync.send(this.phase.state);
  }
}
