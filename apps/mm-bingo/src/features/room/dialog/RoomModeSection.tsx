import { useTranslation } from "react-i18next";

import {
  effectiveClaimSharing,
  type RoomState,
} from "../../../libs/room/types";
import type { RoomConnection } from "../../store/room";
import { useConfirmBoardReset } from "../useConfirmBoardReset";
import { RoomModePicker } from "./RoomModePicker";
import { RoomModeUiToggler } from "./RoomModeUiToggler";

type Props = {
  connection: RoomConnection;
  roomState: RoomState;
};

// Host-only: the host is the sole writer of `mode`/`claimSharing`, so this
// doesn't render (and doesn't need to handle) the guest case at all — see
// RoomConnectedPanel, which only mounts this when connection.role is host.
//
// The picker itself (simple named-presets vs. advanced independent selects,
// toggled via RoomModeUiToggler) lives in RoomModePicker, shared with
// PreConnectionHostNameForm's pre-connect mode choice — this component just
// wires that shared picker to the live session (setMode/setClaimSharing),
// adds the reveal button, and — unlike PreConnectionHostNameForm's
// once-only RevealSettings choice — lets the curtain itself
// (boardRevealed/endsRoomOnReveal) be edited any time the room's already
// live, via setBoardRevealed/setEndsRoomOnReveal (see RoomState's own
// comment on why both stay freely settable after creation).
export const RoomModeSection = ({ connection, roomState }: Props) => {
  const { t } = useTranslation();
  // Switching modes resets claims/memos/reveal state for every player, same
  // consequence as rerolling the seed or changing the task version (see
  // withMode in roomStateTransitions.ts) — gated behind the same
  // confirmation those already use. claimSharing alone doesn't reset
  // anything (see withClaimSharing), so RoomModePicker never gates that one
  // behind this.
  const confirmBoardReset = useConfirmBoardReset();

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
      <legend className="fieldset-legend">
        {t("room.mode.title")}
        <RoomModeUiToggler />
      </legend>
      <div className="grid gap-2 px-2">
        <RoomModePicker
          value={{
            mode: roomState.mode,
            claimSharing: effectiveClaimSharing(roomState),
          }}
          onModeChange={(mode) => connection.session.setMode(mode)}
          onClaimSharingChange={(claimSharing) =>
            connection.session.setClaimSharing(claimSharing)
          }
          confirmModeChange={confirmBoardReset}
        />
        {/* Direct, side-effect-free curtain controls — neither resets
            claims/progress, so unlike the mode picker above neither needs
            confirmBoardReset (see setBoardRevealed/setEndsRoomOnReveal's
            own comments). */}
        <label className="fieldset-label">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={!roomState.boardRevealed}
            onChange={(e) =>
              connection.session.setBoardRevealed(!e.currentTarget.checked)
            }
          />
          {t("room.boardHidden")}
        </label>
        <label className="fieldset-label">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={roomState.endsRoomOnReveal}
            onChange={(e) =>
              connection.session.setEndsRoomOnReveal(e.currentTarget.checked)
            }
          />
          {t("room.endsRoomOnReveal")}
        </label>
        {/* Shown whenever there's anything left for revealBoard() to do:
            either the curtain is still closed (boardRevealed false — see
            RoomState's own comment), or the mode's own rule-mandated
            progress isn't finished (revealedCells). classic/othello with no
            curtain never show this: they start both already "revealed". */}
        {(!roomState.boardRevealed || roomState.revealedCells !== "all") && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => connection.session.revealBoard()}
          >
            {t("room.reveal")}
          </button>
        )}
      </div>
    </fieldset>
  );
};
