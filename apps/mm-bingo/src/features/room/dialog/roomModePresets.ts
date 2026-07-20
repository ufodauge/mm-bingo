import type { ClaimSharing, GameModeId } from "../../../libs/room/types";

// The "simple" mode picker's options — each one bundles a `mode` +
// `claimSharing` pair under a single name matching how these are actually
// talked about (bingo community terms, not this app's own internal mode
// IDs): "Lockout" and "Team Blackout" are both `classic` under the hood,
// distinguished only by whether a claimed cell can be claimed by a second
// team. The advanced picker (RoomModeSection, when the
// `advancedRoomModeAtom` setting is on) still lets a host set `mode` and
// `claimSharing` independently — this list only names the two combinations
// that come up often enough to deserve their own option.
export type SimpleModePresetId =
  | "lockout"
  | "teamBlackout"
  | "othello"
  | "hiddenStart";

// "lockout"/"teamBlackout" are new names this picker introduces, so they get
// their own room.mode.simple.* strings; the other two are just the advanced
// picker's existing mode names (room.mode.hidden etc.) — see the
// SimpleModePresetId comment above for why "hiddenStart" and "hidden" differ
// instead of matching exactly. Written out as a literal union (rather than
// `string`) so it satisfies react-i18next's own generated key type at every
// `t(preset.labelKey)` call site.
type ModeLabelKey =
  | "room.mode.simple.lockout"
  | "room.mode.simple.teamBlackout"
  | "room.mode.othello"
  | "room.mode.hidden";

export type SimpleModePreset = {
  id: SimpleModePresetId;
  mode: GameModeId;
  claimSharing: ClaimSharing;
  labelKey: ModeLabelKey;
};

export const SIMPLE_MODE_PRESETS: SimpleModePreset[] = [
  {
    id: "lockout",
    mode: "classic",
    claimSharing: "exclusive",
    labelKey: "room.mode.simple.lockout",
  },
  {
    id: "teamBlackout",
    mode: "classic",
    claimSharing: "shared",
    labelKey: "room.mode.simple.teamBlackout",
  },
  {
    id: "othello",
    mode: "othello",
    claimSharing: "exclusive",
    labelKey: "room.mode.othello",
  },
  {
    id: "hiddenStart",
    mode: "hidden",
    claimSharing: "exclusive",
    labelKey: "room.mode.hidden",
  },
];

// A direct lookup, not a resolving one — the caller is expected to already
// have a definite `claimSharing` (e.g. via `effectiveClaimSharing` on a
// real RoomState) rather than pass through whatever an "othello" room
// happens to be carrying, since RoomState no longer carries anything at
// all for `claimSharing` in that case (see its own comment).
export const findSimpleModePreset = (
  mode: GameModeId,
  claimSharing: ClaimSharing,
): SimpleModePreset | undefined =>
  SIMPLE_MODE_PRESETS.find(
    (p) => p.mode === mode && p.claimSharing === claimSharing,
  );
