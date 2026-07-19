import { Trans, useTranslation } from "react-i18next";

import { MainBoard } from "../features/board/MainBoard";
import { Header } from "../features/Header";
import { NotificationToasts } from "../features/NotificationToasts";
import { RoomStatsHandle } from "../features/room/stats/RoomStatsHandle";

export const App = () => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-2">
      <div className="sticky top-0 z-10 p-2">
        <Header />
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2">
        <div />
        <div className="grid gap-2 xl:grid-cols-[2fr_1fr]">
          <div className="grid justify-center p-2">
            <MainBoard />
          </div>
          <div className="max-2-100 grid min-w-80 place-content-start gap-2 p-10 *:list-disc [&>ul>li]:ml-6">
            <Trans t={t} i18nKey={"description"} />
          </div>
        </div>
        <RoomStatsHandle />
      </div>
      <NotificationToasts />
    </div>
  );
};
