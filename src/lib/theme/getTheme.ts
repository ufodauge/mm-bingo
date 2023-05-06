import { DarkTheme } from "@/const/theme/dark";
import { LightTheme } from "@/const/theme/light";
import { ThemeName } from "@/types/theme/theme";
import { Theme } from "@emotion/react";

export const getTheme = (theme: ThemeName): Theme => {
  switch (theme) {
    case "dark":
      return DarkTheme;
  }
  return LightTheme;
};
