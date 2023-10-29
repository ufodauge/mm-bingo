import { ThemeName } from "@/types/theme/theme";
import { createContext } from "react";

export type ThemeValueProps = {
  themeName: ThemeName;
};

export const ThemeValue = createContext<ThemeValueProps>({
  themeName: "light",
});
