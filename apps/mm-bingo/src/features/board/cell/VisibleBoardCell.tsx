import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { calculatePreferredTextColor } from "../../../libs/color";
import type { CellInteraction } from "../../room/cell/useCellInteraction";
import type { Cell } from "../../store/board";
import { CellButton } from "./CellButton";
import { CellOverlays } from "./CellOverlays";
import { CellTrackers } from "./CellTrackers";

type Props = {
  cell: Cell;
  className?: string;
  showTrackers?: boolean;
  interaction: CellInteraction;
};

// Rendered whenever this cell's task text is visible to the current viewer
// — see useCellInteraction's `textVisible`, and CoveredBoardCell for the
// alternative.
export const VisibleBoardCell = ({
  cell,
  className,
  showTrackers,
  interaction,
}: Props) => {
  const { activeColor, locked, onClick, onContextMenu } = interaction;
  const { i18n } = useTranslation();
  const textColor = useMemo(
    () =>
      activeColor && activeColor.startsWith("#")
        ? calculatePreferredTextColor(activeColor as `#${string}`)
        : undefined,
    [activeColor],
  );

  return (
    <div
      className={`${className} grid grid-cols-[1fr_auto] grid-rows-[auto_1fr_auto]`}
    >
      <CellButton
        data-testid={`board-cell-${cell.index}`}
        className={`@container col-span-full row-span-full grid translate-0 ${locked ? "cursor-default" : ""}`}
        onClick={onClick}
        onContextMenu={onContextMenu}
        style={{ backgroundColor: activeColor }}
      >
        <p
          className="grid text-center text-[min(14cqw,1.125rem)] wrap-anywhere break-keep"
          style={{ color: textColor }}
        >
          {cell.text[i18n.language] ?? cell.text["en"]}
        </p>

        {showTrackers && (
          <CellTrackers trackers={cell.trackers} textColor={textColor} />
        )}
      </CellButton>
      <CellOverlays
        cellIndex={cell.index}
        interaction={interaction}
        memoClassName="col-start-2 row-start-1"
        claimantsClassName="col-start-2 row-start-2"
      />
    </div>
  );
};
