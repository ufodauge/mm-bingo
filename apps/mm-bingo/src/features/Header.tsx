import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { OpenSettingsButton } from "./OpenSettingsButton";
import { RoomButton } from "./room/RoomButton";
import { SeedInput } from "./settings/SeedInput";
import { roomConnectionAtom } from "./store/room";

export const Header = () => {
  const { t } = useTranslation();
  const connection = useAtomValue(roomConnectionAtom);
  // Guests follow the host's seed/version (see seedNumberAtom), so editing
  // it locally would just be overwritten — hide the control entirely rather
  // than show an input that silently doesn't work.
  const showSeedInput = connection?.role !== "guest";

  return (
    <div className="bg-base-200/50 grid grid-cols-[auto_1fr] items-center rounded-md p-2 shadow-sm backdrop-blur-md">
      <div className="btn btn-ghost btn-lg max-sm:fade-inline overflow-x-hidden rounded-md text-nowrap">
        {t("title")}
      </div>
      <div className="bg-base-100/60 flex items-center gap-2 justify-self-end rounded-md p-2 shadow">
        {showSeedInput && <SeedInput />}
        <RoomButton />
        <OpenSettingsButton />
      </div>
    </div>
  );
};
