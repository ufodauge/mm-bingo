import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  type ClaimSharing,
  type GameModeId,
  type RevealSettings,
} from "../../../libs/room/types";
import { PreConnectionGuestJoinForm } from "./pre-connection/PreConnectionGuestJoinForm";
import { PreConnectionHostNameForm } from "./pre-connection/PreConnectionHostNameForm";
import { PreConnectionIdleForm } from "./pre-connection/PreConnectionIdleForm";
import type { PreConnectionStep } from "./pre-connection/steps";

type Props = {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  initialRoomCode: string | null;
  onHost: (
    mode: GameModeId,
    claimSharing: ClaimSharing,
    revealSettings: RevealSettings,
  ) => void;
  onJoin: (roomId: string) => void;
};

// The three screens shown before a RoomSession exists yet: pick a role,
// then (for hosting) a mode, or (for joining) a room code. Owns all of
// that transient form state itself — none of it needs to survive past a
// successful onHost/onJoin, unlike the session-level state RoomDialog
// keeps.
export const RoomPreConnectForm = ({
  displayName,
  onDisplayNameChange,
  initialRoomCode,
  onHost,
  onJoin,
}: Props) => {
  const { t } = useTranslation();
  // A shared invite link (`?joinCode=...`) opens the join form directly,
  // pre-filled with the code it carried.
  const [step, setStep] = useState<PreConnectionStep>(() =>
    initialRoomCode
      ? { kind: "guest-join", roomId: initialRoomCode }
      : { kind: "idle" },
  );

  const form =
    step.kind === "idle" ? (
      <PreConnectionIdleForm setStep={setStep} />
    ) : step.kind === "host-name" ? (
      <PreConnectionHostNameForm
        displayName={displayName}
        onDisplayNameChange={onDisplayNameChange}
        onHost={onHost}
      />
    ) : (
      <PreConnectionGuestJoinForm
        displayName={displayName}
        onDisplayNameChange={onDisplayNameChange}
        onJoin={onJoin}
        step={step}
        setStep={setStep}
      />
    );

  return (
    <div className="grid gap-2">
      <h3 className="text-2xl font-bold">{t("room.title")}</h3>
      <div className="grid gap-2 px-4">{form}</div>
    </div>
  );
};
