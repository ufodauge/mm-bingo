import { atom } from "jotai";

// Shared between RoomStatsDrawer (the panel, which owns the DOM id below
// and is the only one with a direct ref to attach a `toggle` listener) and
// RoomStatsHandle (the pull-tab, which lives elsewhere in the tree — see
// App.tsx — and only needs to *read* whether the panel is currently open,
// for its arrow direction and aria-expanded). Not persisted: this is
// purely "is the popover open right now" for the current page, not
// something to restore across reloads.
export const ROOM_STATS_PANEL_ID = "room-stats-panel";

export const roomStatsOpenAtom = atom(false);
