type Rect = { top: number; bottom: number; left: number; right: number };
type Size = { width: number; height: number };

// Pure so the "which side, and where exactly" decision is testable without
// a real popover element — see CellClaimMenu, the only caller, for how the
// inputs are measured and the output applied.
export const computeMenuPosition = (
  cellRect: Rect,
  menuSize: Size,
  viewport: Size,
  margin: number,
): { top: number; left: number } => {
  // Pick whichever side of the cell actually has more room, rather than
  // always preferring "below" and only flipping to "above" once that
  // doesn't fit — a cell near the bottom of a short viewport (e.g. a
  // card/row popup window) can leave a flipped menu still too tall for
  // the space above it too, and the clamp below (needed to keep the menu
  // on-screen either way) then has nowhere sensible left to land except
  // the viewport's very top edge, however far that ends up from the cell
  // that was actually clicked. Choosing the roomier side first means that
  // clamp only ever nudges the menu, it doesn't relocate it across the
  // screen.
  const spaceBelow = viewport.height - margin - cellRect.bottom;
  const spaceAbove = cellRect.top - margin;
  const placeBelow = spaceBelow >= spaceAbove;
  let top = placeBelow
    ? cellRect.bottom + margin
    : cellRect.top - menuSize.height - margin;
  top = Math.max(
    margin,
    Math.min(top, viewport.height - margin - menuSize.height),
  );

  let left = cellRect.left;
  if (left + menuSize.width > viewport.width - margin) {
    left = cellRect.right - menuSize.width; // align to the right edge
  }
  left = Math.max(
    margin,
    Math.min(left, viewport.width - margin - menuSize.width),
  );

  return { top, left };
};
