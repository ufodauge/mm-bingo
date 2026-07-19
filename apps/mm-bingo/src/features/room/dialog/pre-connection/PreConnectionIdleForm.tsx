import { useTranslation } from "react-i18next";

import { IconGroup } from "../../../../libs/icons/Group";
import { IconGroupJoin } from "../../../../libs/icons/GroupJoin";
import type { PreConnectionStep } from "./steps";

type Props = {
  setStep: (step: PreConnectionStep) => void;
};

export const PreConnectionIdleForm = ({ setStep }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="grid h-30 grid-cols-2 gap-2">
      <button
        className="btn-primary btn btn-outline h-full rounded-md"
        data-testid="room-role-host-button"
        onClick={() => setStep({ kind: "host-name" })}
      >
        <div>
          {t("room.host")}
          <span className="size-8 fill-current">
            <IconGroup />
          </span>
        </div>
      </button>
      <button
        className="btn-secondary btn btn-outline h-full rounded-md"
        data-testid="room-role-guest-button"
        onClick={() => setStep({ kind: "guest-join", roomId: "" })}
      >
        <div>
          {t("room.guest")}
          <span className="size-8 fill-current">
            <IconGroupJoin />
          </span>
        </div>
      </button>
    </div>
  );
};
