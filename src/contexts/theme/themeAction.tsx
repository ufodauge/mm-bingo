import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import { ThemeName } from "@/types/theme/theme";
import { createContext } from "react";

export type ThemeActionProps = {
  toggle: () => void;
  setTheme: (themeName: ThemeName) => void;
};

export const ThemeAction = createContext<ThemeActionProps>({
  toggle: () => {
    throw new UnimplementedFunctionCalledException();
  },
  setTheme: () => {
    throw new UnimplementedFunctionCalledException();
  },
});

