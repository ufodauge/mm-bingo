import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

import { advancedRoomModeAtom } from "../../store/room";

// Lives next to RoomModeSection (the picker it switches between simple and
// advanced) rather than in the general settings panel — it's specifically
// about how one host operates the mode picker, not an app-wide preference,
// so it reads better right next to what it controls.
export const RoomModeUiToggler = () => {
  const [advanced, setAdvanced] = useAtom(advancedRoomModeAtom);
  const { t } = useTranslation();

  return (
    <label className="label gap-2 text-xs">
      <input
        type="checkbox"
        className="toggle toggle-primary toggle-xs"
        checked={advanced}
        onChange={(e) => setAdvanced(e.currentTarget.checked)}
      />
      {t("room.mode.advancedToggle")}
    </label>
  );
};
