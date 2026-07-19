import { useTranslation } from "react-i18next";

import type { PreConnectionGuestJoinStep, PreConnectionStep } from "./steps";

type Props = {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onJoin: (roomId: string) => void;
  step: PreConnectionGuestJoinStep;
  setStep: (step: PreConnectionStep) => void;
};

export const PreConnectionGuestJoinForm = ({
  displayName,
  onDisplayNameChange,
  onJoin,
  step,
  setStep,
}: Props) => {
  const { t } = useTranslation();

  const submitJoin = () => {
    if (step.kind !== "guest-join") {
      return;
    }
    const roomId = step.roomId.trim();
    if (!roomId) {
      setStep({ ...step, error: t("room.invite.roomCodeRequired") });
      return;
    }
    onJoin(roomId);
  };

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
      <legend className="fieldset-legend">{t("room.join")}</legend>
      <div className="grid gap-2 px-2">
        <input
          className="input input-sm"
          placeholder={t("room.namePlaceholder")}
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.currentTarget.value)}
        />
        <label className="fieldset-label">{t("room.invite.roomCode")}</label>
        <input
          className="input input-sm"
          data-testid="room-code-input"
          value={step.roomId}
          onChange={(e) => setStep({ ...step, roomId: e.currentTarget.value })}
        />
        {step.error && <p className="text-error text-sm">{step.error}</p>}
        <button className="btn btn-sm btn-primary" onClick={submitJoin}>
          {t("room.join")}
        </button>
      </div>
    </fieldset>
  );
};
