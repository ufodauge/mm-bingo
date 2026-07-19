import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import {
  GAME_MODE_IDS,
  type ClaimSharing,
  type GameModeId,
} from "../../../libs/room/types";
import { advancedRoomModeAtom } from "../../store/room";
import { findSimpleModePreset, SIMPLE_MODE_PRESETS } from "./roomModePresets";

export type RoomModeValue = { mode: GameModeId; claimSharing: ClaimSharing };

type Props = {
  value: RoomModeValue;
  onModeChange: (mode: GameModeId) => void;
  onClaimSharingChange: (claimSharing: ClaimSharing) => void;
  // RoomModeSection (a live room) gates a mode change behind
  // useConfirmBoardReset since it resets every player's claims/reveal
  // progress; PreConnectionHostNameForm (nothing to reset yet, no
  // connection at all) passes that same hook anyway — it resolves to an
  // always-true no-op confirm when there's no host connection, so both
  // sites can share one required prop instead of one of them needing a
  // separate no-op path.
  confirmModeChange: () => boolean;
};

// The mode+claimSharing picker itself, shared by RoomModeSection (editing a
// live room) and PreConnectionHostNameForm (choosing the room's starting
// values before it exists): the same "simple" named-preset select bundling
// both, or "advanced" pair of independent selects, switched by the same
// advancedRoomModeAtom preference either way — just wired to a live
// session's setMode/setClaimSharing in one case and to plain local state in
// the other.
export const RoomModePicker = (props: Props) => {
  const advanced = useAtomValue(advancedRoomModeAtom);
  return advanced ? (
    <RoomModeAdvancedPicker {...props} />
  ) : (
    <RoomModeSimplePicker {...props} />
  );
};

const RoomModeSimplePicker = ({
  value,
  onModeChange,
  onClaimSharingChange,
  confirmModeChange,
}: Props) => {
  const { t } = useTranslation();
  const currentPreset = findSimpleModePreset(value.mode, value.claimSharing);

  return (
    <select
      className="select select-sm"
      value={currentPreset?.id ?? ""}
      onChange={(e) => {
        const preset = SIMPLE_MODE_PRESETS.find(
          (p) => p.id === e.currentTarget.value,
        );
        if (!preset) {
          return;
        }
        if (!confirmModeChange()) {
          e.currentTarget.value = currentPreset?.id ?? "";
          return;
        }
        onModeChange(preset.mode);
        onClaimSharingChange(preset.claimSharing);
      }}
    >
      {!currentPreset && <option value="" disabled />}
      {SIMPLE_MODE_PRESETS.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {t(preset.labelKey)}
        </option>
      ))}
    </select>
  );
};

const RoomModeAdvancedPicker = ({
  value,
  onModeChange,
  onClaimSharingChange,
  confirmModeChange,
}: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <select
        className="select select-sm"
        value={value.mode}
        onChange={(e) => {
          const mode = e.currentTarget.value as GameModeId;
          if (!confirmModeChange()) {
            e.currentTarget.value = value.mode;
            return;
          }
          onModeChange(mode);
        }}
      >
        {GAME_MODE_IDS.map((mode) => (
          <option key={mode} value={mode}>
            {t(`room.mode.${mode}`)}
          </option>
        ))}
      </select>
      <label className="fieldset-label" htmlFor="claim-sharing">
        {t("room.claimSharing.title")}
      </label>
      <select
        id="claim-sharing"
        className="select select-sm"
        value={value.claimSharing}
        disabled={value.mode === "othello"}
        onChange={(e) =>
          onClaimSharingChange(e.currentTarget.value as ClaimSharing)
        }
      >
        <option value="exclusive">{t("room.claimSharing.exclusive")}</option>
        <option value="shared">{t("room.claimSharing.shared")}</option>
      </select>
      {value.mode === "othello" && (
        <p className="text-xs opacity-70">
          {t("room.claimSharing.forcedOthelloNote")}
        </p>
      )}
    </>
  );
};
