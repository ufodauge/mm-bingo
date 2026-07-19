import { useTranslation } from "react-i18next";

type Props = {
  onLeave: () => void;
};

// A guest has joined the Trystero room but hasn't heard from the host yet
// — this can only be the guest side (RoomDialog's startHosting() has the
// host's own state available synchronously, so this state never applies
// to it).
export const RoomConnectingPanel = ({ onLeave }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-2">
      <h3 className="text-2xl font-bold">{t("room.title")}</h3>
      <div className="grid gap-2 px-4">
        <p className="text-sm">{t("room.connecting")}</p>
        <button className="btn btn-sm btn-error" onClick={onLeave}>
          {t("room.leave")}
        </button>
      </div>
    </div>
  );
};
