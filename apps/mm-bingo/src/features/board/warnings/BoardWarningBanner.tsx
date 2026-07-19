import { useTranslation } from "react-i18next";

import { IconRefresh } from "../../../libs/icons/Refresh";
import { useConfirmBoardReset } from "../../room/useConfirmBoardReset";
import { useSetColorIndices } from "../../store/colors/indices";
import { useSeedNumberReducer } from "../../store/seed";

type Props = {
  messageKey: string;
  rerollKey: string;
};

export const BoardWarningBanner = ({ messageKey, rerollKey }: Props) => {
  const { t } = useTranslation();
  const setSeed = useSeedNumberReducer();
  const setColorIndices = useSetColorIndices();
  const confirmBoardReset = useConfirmBoardReset();

  return (
    <div className="alert alert-warning">
      <span>{t(messageKey as unknown as never)}</span>
      <button
        className="btn btn-sm"
        onClick={() => {
          if (!confirmBoardReset()) {
            return;
          }
          setSeed({ action: "randomize" });
          setColorIndices({ action: "clear" });
        }}
      >
        <span className="size-4 fill-current stroke-current">
          <IconRefresh />
        </span>
        {t(rerollKey as unknown as never)}
      </button>
    </div>
  );
};
