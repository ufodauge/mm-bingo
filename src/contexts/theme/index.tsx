/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import { useQuery } from "@/lib/hooks/useQuery";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { getTheme } from "@/lib/theme/getTheme";
import { isThemeName, ThemeName, ThemeNames } from "@/types/theme/theme";
import { css, ThemeProvider } from "@emotion/react";

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
  const { isReady, getQuery, updateQuery } = useRouterPush();

  useEffect(() => {
    if (!isReady) return;

    const { query, pathname } = getQuery();

    if (typeof query.theme === "string" && isThemeName(query.theme)) {
      setThemeName(query.theme);
    } else {
      setThemeName("light");
      updateQuery(pathname, { ...query, theme: "light" });
    }
  }, [isReady]);

  const themeAction: ThemeActionProps = {
    toggle: () => {
      const index = ThemeNames.findIndex((v) => v === themeName);
      const newThemeName = ThemeNames[(index + 1) % ThemeNames.length];

      setThemeName(newThemeName);

      const { pathname, query } = getQuery();

      updateQuery(pathname, { ...query, theme: newThemeName }, true);
    },
    setTheme: setThemeName,
  };

  const themeValue: ThemeValueProps = {
    themeName: themeName,
  };

  const theme = getTheme(themeName);

  const style = css({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.base,
    transitionDuration: ".2s",
    transitionTimingFunction: "ease-in-out",
    minWidth: "100vw",
    minHeight: "100vh",
  });

  return isReady ? (
    <ThemeProvider theme={theme}>
      <ThemeValue.Provider value={themeValue}>
        <ThemeAction.Provider value={themeAction}>
          <div css={style}>{children}</div>
        </ThemeAction.Provider>
      </ThemeValue.Provider>
    </ThemeProvider>
  ) : (
    <></>
  );
};

export const useThemeAction = () => useContext(ThemeAction);
export const useThemeValue = () => useContext(ThemeValue);

export default ThemeWrapper;
