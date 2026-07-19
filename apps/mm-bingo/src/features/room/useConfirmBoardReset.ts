import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { roomConnectionAtom } from "../store/room";

// A host rerolling the seed, changing the task version, or switching the
// room's mode all reset every player's claims/reveal progress (see
// updateBoardSettings/setMode in roomSession.ts), so this gates any of
// those specific, deliberate actions behind a confirmation — not every
// keystroke in a manually-typed seed, which would make typing unusable.
export const useConfirmBoardReset = (): (() => boolean) => {
  const connection = useAtomValue(roomConnectionAtom);
  const { t } = useTranslation();

  return () =>
    connection?.role !== "host" || window.confirm(t("room.confirmBoardReset"));
};
