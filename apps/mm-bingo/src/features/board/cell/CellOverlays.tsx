import { CellClaimMenu } from "../../room/cell/CellClaimMenu";
import type { CellInteraction } from "../../room/cell/useCellInteraction";

type Props = {
  cellIndex: number;
  interaction: CellInteraction;
  memoClassName?: string;
  claimantsClassName?: string;
};

// The overlays shared by both VisibleBoardCell and CoveredBoardCell,
// stacked on top of the cell's own CellButton via CSS Grid: the wrapper div
// they share (see VisibleBoardCell/CoveredBoardCell) is `grid grid-cols-1
// grid-rows-1`, and every direct child — CellButton included — is pinned to
// that same single `col-start-1 row-start-1` cell, so they overlap exactly
// like `position: absolute; inset: 0` would have, without needing absolute
// positioning at all; each overlay then aligns itself within that shared
// cell via `justify-self`/`self-*` instead of `top`/`left`/`bottom`.
//
// `isolate` matters here, not just decoration: CellButton's own `translate-0`
// class gives it its own stacking context, which paints *above* plain
// (non-stacking-context) siblings regardless of DOM order — without their
// own `isolate` here, these badges would render fully hidden behind
// CellButton's background despite being later in the DOM. `isolate` alone
// (no `position`/`z-index` needed) promotes them to the same tier, where
// DOM order (these badges after CellButton) correctly puts them on top.
//
// CellClaimMenu is the one exception — a native popover renders in the top
// layer regardless of its place in the grid, so it needs no placement here.
export const CellOverlays = ({
  cellIndex,
  interaction,
  memoClassName,
  claimantsClassName,
}: Props) => (
  <>
    {interaction.memo && (
      <span
        className={`text-md isolate col-start-1 row-start-1 self-start justify-self-end p-1 leading-none ${memoClassName ?? ""}`}
      >
        {interaction.memo}
      </span>
    )}
    {interaction.otherClaimants.length > 0 && (
      <div
        className={`gap-0.5 isolate col-start-1 row-start-1 flex justify-center self-end justify-self-stretch p-1 ${claimantsClassName ?? ""}`}
      >
        {interaction.otherClaimants.map((team) => (
          <span
            key={team.id}
            className="size-4 rounded-xs"
            style={{ backgroundColor: team.color }}
          />
        ))}
      </div>
    )}
    {interaction.claimMenu && (
      <CellClaimMenu cellIndex={cellIndex} menu={interaction.claimMenu} />
    )}
  </>
);
