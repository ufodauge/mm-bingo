import "i18next";
import translateEn from "./locales/en.json" with { type: "json" };

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof translateEn;
    };
  }
}
