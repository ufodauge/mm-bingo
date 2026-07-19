import { useMemo } from "react";

import { calculatePreferredTextColor } from "../../../libs/color";
import { IconInvisible } from "../../../libs/icons/Invisible";
import type { CellInteraction } from "../../room/cell/useCellInteraction";
import { CellButton } from "./CellButton";
import { CellOverlays } from "./CellOverlays";

type Props = {
  cellIndex: number;
  className?: string;
  interaction: CellInteraction;
};

// Rendered instead of the normal cell whenever its task text isn't visible
// to the current viewer yet ("hidden" mode before its own rule-mandated
// reveal reaches this cell, or any mode while the host's curtain is still
// closed — see RoomState's own comment on boardRevealed) — see
// useCellInteraction's `textVisible`.
export const CoveredBoardCell = ({
  cellIndex,
  className,
  interaction,
}: Props) => {
  const { activeColor, locked, onClick, onContextMenu } = interaction;
  const textColor = useMemo(
    () =>
      activeColor && activeColor.startsWith("#")
        ? calculatePreferredTextColor(activeColor as `#${string}`)
        : undefined,
    [activeColor],
  );
  // A hex color means this cell has a claim visible to the current viewer
  // (their own team's claim while the curtain's closed) — tint the covered
  // cell with it. Otherwise fall back to a plain "covered" look.
  const hasVisibleClaim = activeColor.startsWith("#");

  return (
    <div className={`${className} grid grid-cols-1 grid-rows-1`}>
      <CellButton
        data-testid={`board-cell-${cellIndex}`}
        className={`@container col-start-1 row-start-1 grid translate-0 place-items-center ${hasVisibleClaim ? "" : "bg-base-300"} ${locked ? "cursor-default" : ""}`}
        onClick={onClick}
        onContextMenu={onContextMenu}
        style={hasVisibleClaim ? { backgroundColor: activeColor } : undefined}
      >
        <span
          className="size-6 fill-current opacity-50"
          style={{ color: textColor }}
        >
          <IconInvisible />
        </span>
      </CellButton>
      <CellOverlays cellIndex={cellIndex} interaction={interaction} />
    </div>
  );
};
