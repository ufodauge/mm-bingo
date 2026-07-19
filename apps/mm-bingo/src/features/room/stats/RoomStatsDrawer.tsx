import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";

import { IconOpenInNew } from "../../../libs/icons/OpenInNew";
import { nav } from "../../../routes/nav";
import { roomIdentityAtom, roomStateAtom } from "../../store/room";
import { RoomStatsPanel } from "./RoomStatsPanel";
import { ROOM_STATS_PANEL_ID, roomStatsOpenAtom } from "./roomStatsPanelState";

const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 480;

const openStatsPopout = () => {
  const { availWidth, availHeight } = window.screen;
  const ratio = window.devicePixelRatio;
  const left = ((availWidth - POPUP_WIDTH) / 2) * ratio;
  const top = ((availHeight - POPUP_HEIGHT) / 2) * ratio;
  window.open(
    nav.getNavLink("popup-room-stats"),
    "_blank",
    `left=${left},top=${top},width=${POPUP_WIDTH / ratio},height=${POPUP_HEIGHT / ratio}`,
  );
};

// The sliding panel itself — see RoomStatsHandle (mounted separately, in
// App.tsx's layout grid) for the always-visible pull-tab that opens and
// closes it; splitting them lets the tab be a normal, in-flow `sticky`
// grid item instead of needing pixel offsets of its own (see the tab's own
// comment for why that split was worth it).
//
// A native Popover API `popover="auto"` element (same choice as
// CellClaimMenu) rather than plain state-driven visibility — "auto" is
// what gets light-dismiss (click anywhere outside it, or Escape) for free,
// which a manually-toggled div doesn't have without reimplementing an
// outside-click listener by hand. `popoverTarget`/`popoverTargetAction` on
// the tab wire the toggle up declaratively by this element's id, with no
// parent/child relationship (or even a common mount point) needed between
// them; the `toggle` listener below just mirrors this panel's own
// open/closed state out to roomStatsOpenAtom for the tab to read.
//
// Still portaled straight to document.body, same as RoomButton's dialog:
// mounted inline, this would sit inside whatever stacking context its DOM
// position happens to land in, and board cells deep inside MainBoard (which
// have their own stacking context — see the css-positioning skill's
// `translate-0` note) ended up painting on top of it regardless of z-index
// when this was tried without the portal. The tab doesn't have this
// problem once it's a normal grid item instead of a `fixed` one — see its
// own comment.
//
// Renders nothing outside a room — there's nothing to show a stats panel
// for otherwise (mirrors RoomTeamIndicator/RoomModeIndicator, which this
// replaces).
export const RoomStatsDrawer = () => {
  const roomState = useAtomValue(roomStateAtom);
  const identity = useAtomValue(roomIdentityAtom);
  const panelRef = useRef<HTMLDivElement>(null);
  const setOpen = useSetAtom(roomStatsOpenAtom);

  const onToggle = useEffectEvent((e: Event) => {
    setOpen((e as ToggleEvent).newState === "open");
  });

  const onOpenStatsPopout = () => {
    openStatsPopout();
  };

  useEffect(() => {
    const el = panelRef.current;
    if (!el) {
      return;
    }
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  }, []);

  if (!roomState) {
    return <></>;
  }

  return createPortal(
    <div
      ref={panelRef}
      id={ROOM_STATS_PANEL_ID}
      popover="auto"
      className="room-stats-panel bg-base-100 border-base-300 fixed top-26 right-0 w-80 max-w-[90vw] grid-cols-[1fr_auto] gap-3 rounded-l-md border p-1 shadow-lg"
    >
      <div className="grid p-3">
        <RoomStatsPanel
          roomState={roomState}
          myPeerId={identity?.peerId ?? null}
        />
      </div>

      <button
        className="btn btn-ghost btn-sm btn-circle"
        onClick={onOpenStatsPopout}
      >
        <span className="size-4 fill-current">
          <IconOpenInNew />
        </span>
      </button>
    </div>,
    document.body,
  );
};
