import { useAtomValue } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  ClaimSharing,
  GameModeId,
  RevealSettings,
} from "../../../../libs/room/types";
import { lastRoomSettingsAtom } from "../../../store/room";
import { useConfirmBoardReset } from "../../useConfirmBoardReset";
import { RoomModePicker, type RoomModeValue } from "../RoomModePicker";
import { RoomModeUiToggler } from "../RoomModeUiToggler";

type Props = {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onHost: (
    mode: GameModeId,
    claimSharing: ClaimSharing,
    revealSettings: RevealSettings,
  ) => void;
};

export const PreConnectionHostNameForm = ({
  onDisplayNameChange,
  onHost,
  displayName,
}: Props) => {
  const { t } = useTranslation();
  // A genuinely dead room can never be rejoined (see lastRoomSettingsAtom's
  // own comment), so the closest available thing to "resuming" is starting
  // this new one pre-filled with whatever was last in use, instead of
  // always resetting to the same hardcoded defaults — read once, lazily, so
  // a later change elsewhere doesn't yank the mode out from under the host
  // mid-edit.
  const lastRoomSettings = useAtomValue(lastRoomSettingsAtom);
  const [modeValue, setModeValue] = useState<RoomModeValue>(
    () =>
      lastRoomSettings ?? {
        mode: "classic",
        claimSharing: "exclusive",
      },
  );
  // Orthogonal to mode and to each other (see RevealSettings' own comment
  // on why they're bundled at the RoomSession.host boundary despite being
  // independent choices here) — both only settable here, at creation:
  // nothing ever re-closes the curtain once open, and endsRoomOnReveal
  // only ever matters at the moment of revealing, so there's no equivalent
  // control in RoomModeSection for an already-live room.
  const [revealSettings, setRevealSettings] = useState<RevealSettings>(
    () =>
      lastRoomSettings?.revealSettings ?? {
        startHidden: false,
        endsRoomOnReveal: false,
      },
  );
  // No connection exists yet at this point, so this never actually prompts
  // (see its own comment: it only confirms when the *current* connection's
  // role is host) — reused as-is anyway so RoomModePicker behaves
  // identically here and in RoomModeSection, without a separate
  // always-true stub just for this one call site.
  const confirmModeChange = useConfirmBoardReset();

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
      <legend className="fieldset-legend">{t("room.becomeHost")}</legend>
      <div className="grid gap-2 px-2">
        <input
          className="input input-sm"
          placeholder={t("room.namePlaceholder")}
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.currentTarget.value)}
        />
        <label className="fieldset-label">
          {t("room.mode.title")}
          <RoomModeUiToggler />
        </label>
        <RoomModePicker
          value={modeValue}
          onModeChange={(mode) => setModeValue((v) => ({ ...v, mode }))}
          onClaimSharingChange={(claimSharing) =>
            setModeValue((v) => ({ ...v, claimSharing }))
          }
          confirmModeChange={confirmModeChange}
        />
        <label className="fieldset-label">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={revealSettings.startHidden}
            onChange={(e) =>
              setRevealSettings((v) => ({
                ...v,
                startHidden: e.target.checked,
              }))
            }
          />
          {t("room.startHidden")}
        </label>
        <label className="fieldset-label" hidden>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={revealSettings.endsRoomOnReveal}
            readOnly
            onChange={(e) =>
              setRevealSettings((v) => ({
                ...v,
                endsRoomOnReveal: e.target.checked,
              }))
            }
          />
          {t("room.endsRoomOnReveal")}
        </label>
        <button
          className="btn btn-sm btn-primary"
          onClick={() =>
            onHost(modeValue.mode, modeValue.claimSharing, revealSettings)
          }
        >
          {t("room.becomeHost")}
        </button>
      </div>
    </fieldset>
  );
};
