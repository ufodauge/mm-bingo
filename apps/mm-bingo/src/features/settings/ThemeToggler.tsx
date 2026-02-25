import { useAtom } from "jotai";
import { colorThemeAtom } from "../store/theme";
import { IconDark } from "../../libs/icons/Dark";
import { IconLight } from "../../libs/icons/Light";
import { IconAdjust } from "../../libs/icons/Adjust";
import { useTranslation } from "react-i18next";

export const ThemeToggler = () => {
  const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);
  const { t } = useTranslation();

  return (
    <div className="join">
      <label className="btn join-item has-checked:btn-primary">
        <input
          type="radio"
          name="theme-buttons"
          className="theme-controller size-0"
          checked={colorTheme === "system"}
          onChange={() => setColorTheme("system")}
        />
        <span className="size-4 fill-current">
          <IconAdjust />
        </span>
        {t("settings.colorTheme.system")}
      </label>
      <label className="btn join-item has-checked:btn-primary">
        <input
          type="radio"
          name="theme-buttons"
          className="theme-controller size-0"
          value="light"
          checked={colorTheme === "light"}
          onChange={() => setColorTheme("light")}
        />
        <span className="size-4 fill-current">
          <IconLight />
        </span>
        {t("settings.colorTheme.light")}
      </label>
      <label className="btn join-item has-checked:btn-primary">
        <input
          type="radio"
          name="theme-buttons"
          className="theme-controller size-0"
          value="dark"
          checked={colorTheme === "dark"}
          onChange={() => setColorTheme("dark")}
        />
        <span className="size-4 fill-current">
          <IconDark />
        </span>
        {t("settings.colorTheme.dark")}
      </label>
    </div>
  );
};
