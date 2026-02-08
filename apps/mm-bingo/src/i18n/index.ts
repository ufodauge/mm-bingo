import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translateEn from "./locales/en.json";
import translateJa from "./locales/ja.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translateEn,
      },
      ja: {
        translation: translateJa,
      },
    },
    fallbackLng: ["en", "ja"],

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    react: {
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "ul", "li"],
    },
  });

export { i18n };
