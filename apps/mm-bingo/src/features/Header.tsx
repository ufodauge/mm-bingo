import { SeedInput } from "./settings/SeedInput";
import { OpenSettingsButton } from "./OpenSettingsButton";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-base-200/50 grid grid-cols-[auto_1fr_auto] items-center rounded-md p-2 shadow-sm backdrop-blur-md">
      <div className="btn btn-ghost btn-lg max-sm:fade-inline overflow-x-hidden rounded-md text-nowrap">
        {t("title")}
      </div>
      <div />
      <div className="bg-base-100/60 flex min-w-48 items-center gap-2 rounded-md p-2 shadow">
        <SeedInput />
        <OpenSettingsButton />
      </div>
    </div>
  );
};
