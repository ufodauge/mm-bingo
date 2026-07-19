import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import { RoomSession } from "../../../libs/room/roomSession";
import type {
  ClaimSharing,
  GameModeId,
  RevealSettings,
  RoomState,
  Team,
} from "../../../libs/room/types";
import { useMarkerColorsValue } from "../../store/colors/colors";
import { queryParamsAtom } from "../../store/queryParams";
import {
  displayNameAtom,
  joinCodeAtom,
  roomConnectionAtom,
  roomPhaseAtom,
  roomStateAtom,
  type RoomConnection,
} from "../../store/room";
import { useSeedNumberValue } from "../../store/seed";
import { taskVersionAtom } from "../../store/taskVersion";
import {
  isTaskVersion,
  latestTaskVersion,
} from "../../store/versions/taskVersion";
import {
  applyRoomStateAtom,
  onRoomJoinTimeoutAtom,
  onRoomRoleChangeAtom,
  reconnectToRoomAtom,
} from "../roomActions";
import { RoomConnectedPanel } from "./RoomConnectedPanel";
import { RoomConnectingPanel } from "./RoomConnectingPanel";
import { RoomDisconnectedPanel } from "./RoomDisconnectedPanel";
import { RoomPreConnectForm } from "./RoomPreConnectForm";

const buildTeamsFromMarkerColors = (colors: readonly string[]): Team[] =>
  colors.map((color, i) => ({
    id: crypto.randomUUID(),
    color,
    name: `Team ${i + 1}`,
  }));

// The session/data layer for the room dialog: owns the atoms, builds and
// tears down RoomSession instances, and picks which of the dialog's five
// screens is showing (see roomConnection/roomState below) — every screen
// itself is a separate component (RoomPreConnectForm,
// RoomConnectedPanel, ...) that only knows about its own props, not this
// component's atoms.
export const RoomDialog = () => {
  const markerColors = useMarkerColorsValue();
  const seed = useSeedNumberValue();
  const versionRaw = useAtomValue(taskVersionAtom).toString();
  const taskVersion = isTaskVersion(versionRaw)
    ? versionRaw
    : latestTaskVersion;
  // roomPhase (below) is derived from these same two atoms and already
  // carries their current values in whichever of its branches applies (see
  // roomPhaseAtom's own comment on why it's the one place that mapping
  // lives) — so nothing here reads roomConnectionAtom/roomStateAtom
  // directly, only writes them.
  const setConnection = useSetAtom(roomConnectionAtom);
  const setRoomState = useSetAtom(roomStateAtom);
  const roomPhase = useAtomValue(roomPhaseAtom);
  const applyRoomState = useSetAtom(applyRoomStateAtom);
  const onRoleChange = useSetAtom(onRoomRoleChangeAtom);
  const onJoinTimeout = useSetAtom(onRoomJoinTimeoutAtom);
  const reconnectToRoom = useSetAtom(reconnectToRoomAtom);
  const setQueryParams = useSetAtom(queryParamsAtom);
  const [displayName, setDisplayName] = useAtom(displayNameAtom);
  // joinCodeAtom already consumed (and stripped from the URL) whatever
  // `?joinCode` was present the moment anything first read it — RoomDialog
  // just passes that already-resolved value down as RoomPreConnectForm's
  // initial state, so it stays a pure read with nothing left for a mount
  // effect to do.
  const joinCode = useAtomValue(joinCodeAtom);

  // Every peer's local seed/taskVersion (the URL query params that drive
  // solo play) live independently of the room, so without this they'd
  // revert to whatever each window happened to have before joining —
  // splitting host and guests onto different boards the moment the room
  // ends. Carrying the room's last known values over on every way out of a
  // room (not just a curtain room's auto-exit on reveal — see
  // applyRoomStateAtom) keeps everyone's board identical afterward.
  const returnToSoloMode = (finalState: RoomState | null) => {
    if (finalState) {
      setQueryParams({
        seed: finalState.seed,
        version: finalState.taskVersion,
      });
    }
    setConnection(undefined);
    setRoomState(null);
  };

  const leaveRoom = (
    connection: RoomConnection,
    roomState: RoomState | null,
  ) => {
    connection.session.leave();
    returnToSoloMode(roomState);
  };

  const startHosting = (
    mode: GameModeId,
    claimSharing: ClaimSharing,
    revealSettings: RevealSettings,
  ) => {
    const session = RoomSession.host(
      displayName.trim() || "Host",
      buildTeamsFromMarkerColors(markerColors),
      mode,
      claimSharing,
      revealSettings,
      { seed, taskVersion },
      { onStateChange: applyRoomState, onRoleChange },
    );
    setConnection({ role: "host", session });
  };

  const joinRoom = useCallback(
    (roomId: string): void => {
      const session = RoomSession.join(displayName.trim() || "Guest", roomId, {
        onStateChange: applyRoomState,
        onRoleChange,
        onJoinTimeout,
      });
      setConnection({ role: "guest", session });
    },
    [displayName, applyRoomState, onRoleChange, onJoinTimeout, setConnection],
  );

  // A shared invite link (`?joinCode=...`) skips RoomPreConnectForm's
  // confirmation screen entirely and joins immediately, but only once a
  // display name is already known (getOnInit on displayNameAtom guarantees
  // that's resolved by the time this first runs, not still the "" default)
  // — otherwise the guest form still opens as before so the user can type
  // one. Guarded by a ref rather than reacting to displayName's current
  // value on every run: this must decide once, using whatever name was
  // already saved *before* the link was clicked, not fire the moment the
  // user finishes typing one into the still-open form.
  const hasAttemptedAutoJoin = useRef(false);
  useEffect(() => {
    if (
      hasAttemptedAutoJoin.current ||
      !joinCode ||
      roomPhase.kind !== "none"
    ) {
      return;
    }
    hasAttemptedAutoJoin.current = true;
    if (displayName.trim()) {
      joinRoom(joinCode);
    }
  }, [joinCode, displayName, roomPhase, joinRoom]);

  // Only pushes the rename once there's an actual name to show — otherwise
  // every keystroke of clearing the field would briefly broadcast an empty
  // name to the room before the next character lands.
  const renameSelf = (connection: RoomConnection, name: string) => {
    setDisplayName(name);
    const trimmed = name.trim();
    if (trimmed) {
      connection.session.rename(trimmed);
    }
  };

  switch (roomPhase.kind) {
    case "connected":
      return (
        <RoomConnectedPanel
          connection={roomPhase.connection}
          roomState={roomPhase.roomState}
          displayName={displayName}
          onRenameSelf={(name) => renameSelf(roomPhase.connection, name)}
          onLeave={() => leaveRoom(roomPhase.connection, roomPhase.roomState)}
        />
      );
    case "orphaned": {
      const orphanedState = roomPhase.roomState;
      return (
        <RoomDisconnectedPanel
          onReconnect={() => reconnectToRoom()}
          onLeave={() => returnToSoloMode(orphanedState)}
        />
      );
    }
    case "connecting":
      return (
        <RoomConnectingPanel
          onLeave={() => leaveRoom(roomPhase.connection, null)}
        />
      );
    case "none":
      return (
        <RoomPreConnectForm
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          initialRoomCode={joinCode}
          onHost={startHosting}
          onJoin={joinRoom}
        />
      );
  }
};
