import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { createRandomColor } from "../libs/color";
import { IconAdd } from "../libs/icons/Add";
import { LanguageSelector } from "./settings/LanguageSelector";
import { MarkerColorSetters } from "./settings/MarkerColorSetters";
import { TaskVersionSelector } from "./settings/TaskVersionSelector";
import { ThemeToggler } from "./settings/ThemeToggler";
import { useSetMarkerColors } from "./store/colors/colors";
import { roomConnectionAtom } from "./store/room";
// import { ThemeColorSetters } from "./settings/ThemeColorSetters";

export const SettingsForm = () => {
  const setMarkerColors = useSetMarkerColors();
  const { t } = useTranslation();
  const connection = useAtomValue(roomConnectionAtom);
  // Guests follow the host's task version (see taskVersionAtom), so editing
  // it locally would just be overwritten — same reasoning as hiding
  // SeedInput for guests in Header.tsx.
  const showTaskVersionSelector = connection?.role !== "guest";
  // Teams are derived from the HOST's marker-color palette: an edit here is
  // pushed to the room live while this window already is the host (see
  // useSetMarkerColors in colors.ts), and this window's own palette is
  // resynced to the room's actual team roster on becoming host mid-room too
  // (see onRoomRoleChangeAtom/reconnectToRoomAtom in features/room/
  // roomActions.ts) — so a guest editing their own palette while connected
  // wouldn't do anything to the room's teams either, same reasoning as the
  // two guards above.
  const showMarkerColorEditor = connection?.role !== "guest";

  const addColor = () => {
    const value = createRandomColor();
    if (setMarkerColors({ action: "try-add", value }) === false) {
      console.error("failed to add color");
    }
  };

  return (
    <div className="grid gap-2">
      <h3 className="text-2xl font-bold">{t("settings.title")}</h3>
      <div className="grid gap-2 px-4">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
          <legend className="fieldset-legend">
            {t("settings.language.title")}
          </legend>
          <div className="grid place-items-center gap-2 px-2">
            <LanguageSelector />
          </div>
        </fieldset>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
          <legend className="fieldset-legend">
            {t("settings.colorTheme.title")}
          </legend>
          <div className="grid place-items-center gap-2 px-2">
            <ThemeToggler />
          </div>
        </fieldset>
        {showMarkerColorEditor && (
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">
              {t("settings.markerColors.title")}
            </legend>
            <div className="grid gap-2 px-2">
              <MarkerColorSetters />
              <button className="btn btn-xs btn-primary" onClick={addColor}>
                <span className="size-4 fill-current">
                  <IconAdd />
                </span>
              </button>
            </div>
          </fieldset>
        )}
        {showTaskVersionSelector && (
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">
              {t("settings.taskVersion.title")}
            </legend>
            <div className="grid place-items-center gap-2 px-2">
              <TaskVersionSelector />
            </div>
          </fieldset>
        )}
        {/* <div
          tabIndex={0}
          className="collapse-arrow collapse-open bg-base-100 border-base-300 fieldset collapse border px-4"
        >
          <span className="collapse-title py-2">そのほか</span>
          <fieldset className="collapse-content bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">カラーテーマの編集</legend>
            <div className="grid gap-2 px-2">
              <ThemeColorSetters />
            </div>
          </fieldset>
        </div> */}
      </div>
    </div>
  );
};
