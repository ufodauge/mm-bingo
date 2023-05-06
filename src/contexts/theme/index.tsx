import React, { createContext, ReactNode, useContext, useState } from "react";

import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import { UnknownThemeNameException } from "@/class/exception/unknownThemeName";
import { useQuery } from "@/lib/hooks/useQuery";
import { getTheme } from "@/lib/theme/getTheme";
import { isThemeName, ThemeName, ThemeNames } from "@/types/theme/theme";
import { css, ThemeProvider } from "@emotion/react";
import { useRouterPush } from "@/lib/hooks/useRouterPush";

type ThemeActionProps = {
  toggle: () => void;
  setTheme: (themeName: ThemeName) => void;
};

type ThemeValueProps = {
  themeName: ThemeName;
};

const ThemeAction = createContext<ThemeActionProps>({
  toggle: () => {
    throw new UnimplementedFunctionCalledException();
  },
  setTheme: () => {
    throw new UnimplementedFunctionCalledException();
  },
});

const ThemeValue = createContext<ThemeValueProps>({
  themeName: "light",
});

type Props = {
  children?: ReactNode;
};

const ThemeWrapper: React.FC<Props> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>("light");

  useQuery(
    (v) => {
      if (isThemeName(v.theme)) {
        setThemeName(v.theme);
      }
    },
    { theme: "light" }
  );

  const [getQuery, updateQuery] = useRouterPush();

  const themeAction: ThemeActionProps = {
    toggle: () => {
      const index = ThemeNames.findIndex((v) => v === themeName);
      const newThemeName = ThemeNames[(index + 1) % ThemeNames.length];
      setThemeName(newThemeName);

      const [pathname, query] = getQuery();
      query.theme = newThemeName;
      updateQuery(pathname, query, true);
    },
    setTheme: setThemeName,
  };

  const themeValue: ThemeValueProps = {
    themeName: themeName,
  };

  const theme = getTheme(themeName);

  const style = css({
    backgroundColor: theme.base,
    transitionDuration: ".2s",
    transitionTimingFunction: "ease-in-out",
    minWidth: "100%",
    minHeight: "100vh",
  });

  return (
    <ThemeProvider theme={theme}>
      <ThemeValue.Provider value={themeValue}>
        <ThemeAction.Provider value={themeAction}>
          <div css={style}>{children}</div>
        </ThemeAction.Provider>
      </ThemeValue.Provider>
    </ThemeProvider>
  );
};

export const useThemeAction = () => useContext(ThemeAction);
export const useThemeValue = () => useContext(ThemeValue);

export default ThemeWrapper;
