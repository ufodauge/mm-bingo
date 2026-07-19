import { useTransition } from "react";
import { useTranslation } from "react-i18next";

import { IconCheck } from "../../../libs/icons/Check";
import { IconCopy } from "../../../libs/icons/Copy";
import { sleep } from "../../../libs/sleep";

type Props = {
  roomId: string;
};

const buildInviteLink = (roomId: string): string => {
  const url = new URL(window.location.href);
  url.searchParams.set("joinCode", roomId);
  return url.toString();
};

export const RoomInviteSection = ({ roomId }: Props) => {
  const { t } = useTranslation();
  const [isLinkCopying, dispatchLinkCopying] = useTransition();
  const inviteLink = buildInviteLink(roomId);

  const copyInviteLink = () => {
    dispatchLinkCopying(async () => {
      await navigator.clipboard.writeText(inviteLink);
      await sleep(500);
    });
  };

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
      <legend className="fieldset-legend">{t("room.invite.title")}</legend>
      <div className="grid gap-2 px-2">
        <label className="fieldset-label">
          {t("room.invite.copyLink")}
          <code className="bg-base-300 rounded-md px-3">{roomId}</code>
        </label>
        <label className="input input-sm w-full">
          <input
            readOnly
            data-testid="room-code-display"
            value={inviteLink}
            onFocus={(e) => e.currentTarget.select()}
          />
          <label
            className="swap swap-rotate"
            onClick={() => void copyInviteLink()}
          >
            <input type="checkbox" checked={isLinkCopying} readOnly />
            <span className="swap-on size-4 fill-current">
              <IconCheck />
            </span>
            <span className="swap-off size-4 fill-current">
              <IconCopy />
            </span>
          </label>
        </label>
      </div>
    </fieldset>
  );
};
