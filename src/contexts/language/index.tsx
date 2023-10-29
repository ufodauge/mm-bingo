/* eslint-disable react-hooks/exhaustive-deps */
import React, { ReactNode, memo, useContext, useEffect, useState } from 'react';

import { useRouterPush } from '@/lib/hooks/useRouterPush';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { LanguageAction, LanguageActionProps } from './languageAction';
import { LanguageValue, LanguageValueProps } from './languageValue';

type Props = {
  children?: ReactNode;
};

const LanguageProvider = memo<Props>(function LanguageProvider({ children }) {
  const taskData = useTaskData();

  const [languageName, setLanguageName] = useState<string>(taskData.lang[0]);
  const { isReady, getQuery, updateQuery } = useRouterPush();

  useEffect(() => {
    if (!isReady) return;

    const { query, pathname } = getQuery();

    if (typeof query.lang === "string") {
      setLanguageName(query.lang);
    } else {
      setLanguageName(taskData.lang[0]);
      updateQuery(pathname, { ...query, lang: taskData.lang[0] });
    }
  }, [isReady]);

  const languageAction: LanguageActionProps = {
    setLanguage: setLanguageName,
  };

  const languageValue: LanguageValueProps = {
    languageName,
  };

  return (
    <LanguageValue.Provider value={languageValue}>
      <LanguageAction.Provider value={languageAction}>
        {children}
      </LanguageAction.Provider>
    </LanguageValue.Provider>
  );
});

export const useLanguageAction = () => useContext(LanguageAction);
export const useLanguageValue = () => useContext(LanguageValue);

export default LanguageProvider;
