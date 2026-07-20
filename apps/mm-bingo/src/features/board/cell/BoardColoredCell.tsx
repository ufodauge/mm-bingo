import type { ReactNode } from "react";

import { useCellInteraction } from "../../room/cell/useCellInteraction";
import type { Cell } from "../../store/board";
import { CoveredBoardCell } from "./CoveredBoardCell";
import { VisibleBoardCell } from "./VisibleBoardCell";

type Props = {
  cell: Cell;
  className?: string;
  showTrackers?: boolean;
};

// Picks between the two ways a cell can render — see useCellInteraction's
// `textVisible`. Neither branch has an opinion of its own about how big it
// should be: `className` (the click-handling isolation boundary
// CellClaimMenu needs — its own clicks must not bubble into the cell's
// onClick/onContextMenu — and so also the element the grid actually lays
// out) is passed straight through, so sizing is entirely up to the caller.
// Every current caller passes `size-full` because they place it in a real
// grid item that's already the right size — but a `place-self-stretch`
// only works if the caller's own immediate parent is itself a grid/flex
// item, which isn't this element.
export const BoardColoredCell = ({
  cell,
  className,
  showTrackers,
}: Props): ReactNode => {
  const interaction = useCellInteraction(cell);

  return interaction.textVisible ? (
    <VisibleBoardCell
      cell={cell}
      className={className}
      showTrackers={showTrackers}
      interaction={interaction}
    />
  ) : (
    <CoveredBoardCell
      cellIndex={cell.index}
      className={className}
      interaction={interaction}
    />
  );
};
