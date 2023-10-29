import { createContext } from "react";

export type LanguageValueProps = {
  languageName: string;
};

export const LanguageValue = createContext<LanguageValueProps>({
  languageName: "en",
});
