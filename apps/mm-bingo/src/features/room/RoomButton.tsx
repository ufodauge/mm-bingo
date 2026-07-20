import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { IconGroup } from "../../libs/icons/Group";
import {
  displayNameAtom,
  joinCodeAtom,
  roomConnectionAtom,
  roomPhaseAtom,
} from "../store/room";
import { RoomDialog } from "./dialog/RoomDialog";

export const RoomButton = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // RoomDialog's pre-connect screen (RoomPreConnectForm) keeps its "which
  // role did you pick" step in local state, and the native <dialog> below
  // is only ever hidden/shown, never unmounted while closed — so without
  // this, picking "guest" and then closing without joining would leave the
  // guest form stuck there forever on the next open. Bumping this key on
  // every close forces a fresh RoomDialog (and thus a fresh
  // RoomPreConnectForm) the next time it opens.
  const [dialogInstance, setDialogInstance] = useState(0);
  const connection = useAtomValue(roomConnectionAtom);
  const roomPhase = useAtomValue(roomPhaseAtom);
  // A guest session that hasn't heard from the room yet (fresh join or
  // reconnect — see RoomConnectingPanel) — the room dialog already shows
  // this, but only while it's open; this badge is what makes it visible
  // the rest of the time too, e.g. while waiting with the dialog closed.
  // Never true for a host: RoomSession.host() always has state
  // synchronously (see RoomDialog's startHosting), so the two badges here
  // never need to compete for the same corner.
  const isConnecting = roomPhase.kind === "connecting";
  // joinCodeAtom consumes `?joinCode` exactly once no matter how many
  // places read it (see its definition), so there's no race to worry about
  // between this and RoomDialog reading the same atom.
  const joinCode = useAtomValue(joinCodeAtom);
  const displayName = useAtomValue(displayNameAtom);

  // A shared invite link (`?joinCode=...`) opens the join form directly —
  // unless a display name is already saved, in which case RoomDialog's own
  // effect joins immediately without ever showing this dialog at all (see
  // its comment), so opening it here first would just flash it briefly.
  useEffect(() => {
    if (joinCode && !displayName.trim()) {
      dialogRef.current?.showModal();
    }
  }, [joinCode, displayName]);

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t("room.title")}
        data-testid="room-toggle-button"
        className={`btn btn-primary btn-sm btn-circle relative ${className}`}
      >
        <div className="indicator">
          {connection?.role === "host" && (
            <span
              className="indicator-item badge badge-warning badge-xs"
              title={t("room.role.host")}
            >
              {t("room.role.hostBadge")}
            </span>
          )}
          {isConnecting && (
            <span
              className="indicator-item loading loading-spinner loading-xs text-warning"
              title={t("room.connectingIndicator")}
            />
          )}
          <div className="grid size-6 place-items-center">
            <span className="size-4 fill-current">
              <IconGroup />
            </span>
          </div>
        </div>
      </button>
      {createPortal(
        <dialog
          ref={dialogRef}
          className="modal"
          onClose={() => setDialogInstance((n) => n + 1)}
        >
          <div className="modal-box bg-base-100/90 backdrop-blur-lg">
            <RoomDialog key={dialogInstance} />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>,
        document.body,
      )}
    </>
  );
};
