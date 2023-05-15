/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { useTaskData } from "@/lib/hooks/useTaskData";

type LanguageActionProps = {
  setLanguage: (languageName: string) => void;
};

type LanguageValueProps = {
  languageName: string;
};

const LanguageAction = createContext<LanguageActionProps>({
  setLanguage: () => {
    throw new UnimplementedFunctionCalledException();
  },
});

const LanguageValue = createContext<LanguageValueProps>({
  languageName: "en",
});

type Props = {
  children?: ReactNode;
};

const LanguageProvider: React.FC<Props> = ({ children }) => {
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

  return isReady ? (
    <LanguageValue.Provider value={languageValue}>
      <LanguageAction.Provider value={languageAction}>
        {children}
      </LanguageAction.Provider>
    </LanguageValue.Provider>
  ) : (
    <></>
  );
};

export const useLanguageAction = () => useContext(LanguageAction);
export const useLanguageValue = () => useContext(LanguageValue);

export default LanguageProvider;
