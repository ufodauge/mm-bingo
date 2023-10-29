import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import { createContext } from "react";

export type LanguageActionProps = {
  setLanguage: (languageName: string) => void;
};

export const LanguageAction = createContext<LanguageActionProps>({
  setLanguage: () => {
    throw new UnimplementedFunctionCalledException();
  },
});
