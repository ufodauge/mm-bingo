/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, ReactNode, useContext, useEffect, useState } from 'react';

import { darkThemeClass } from '@/const/theme/dark.css';
import { lightThemeClass } from '@/const/theme/light.css';
import { useRouterPush } from '@/lib/hooks/useRouterPush';
import { isThemeName, ThemeName, ThemeNames } from '@/types/theme/theme';

import * as style from './index.css';
import { ThemeAction, ThemeActionProps } from './themeAction';
import { ThemeValue, ThemeValueProps } from './themeValue';

type Props = {
  children?: ReactNode;
};

const ThemeWrapper = memo<Props>(function ThemeWrapper({ children }) {
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

  const theme = themeName === "dark" ? darkThemeClass : lightThemeClass;

  return (
    <div className={theme}>
      <ThemeValue.Provider value={themeValue}>
        <ThemeAction.Provider value={themeAction}>
          <div className={style.container}>
            {children}
          </div>
        </ThemeAction.Provider>
      </ThemeValue.Provider>
    </div>
  );
});

export const useThemeAction = () => useContext(ThemeAction);
export const useThemeValue = () => useContext(ThemeValue);

export default ThemeWrapper;
