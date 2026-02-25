import { useTranslation } from "react-i18next";

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  return (
    <select
      className="select"
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.currentTarget.value)}
    >
      {i18n.languages.map((v, i) => (
        <option value={v} key={i}>
          {t(`settings.language.${v}` as unknown as never)}
        </option>
      ))}
    </select>
  );
};
