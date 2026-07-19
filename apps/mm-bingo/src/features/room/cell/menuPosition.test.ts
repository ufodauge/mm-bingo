import { describe, expect, it } from "vitest";

import { computeMenuPosition } from "./menuPosition";

const viewport = { width: 900, height: 947 };
const margin = 4;

describe("computeMenuPosition", () => {
  it("places the menu below a cell with plenty of room below", () => {
    const cellRect = { top: 200, bottom: 240, left: 100, right: 200 };
    const menuSize = { width: 200, height: 150 };

    const { top } = computeMenuPosition(cellRect, menuSize, viewport, margin);

    expect(top).toBe(244); // cellRect.bottom + margin
  });

  it("flips above a cell near the bottom when the menu fits above it", () => {
    const cellRect = { top: 850, bottom: 890, left: 100, right: 200 };
    const menuSize = { width: 200, height: 300 };

    const { top } = computeMenuPosition(cellRect, menuSize, viewport, margin);

    expect(top).toBe(546); // cellRect.top - menuSize.height - margin
    expect(top + menuSize.height).toBeLessThanOrEqual(viewport.height);
  });

  it("prefers the roomier side even when it doesn't fully fit either, instead of always flipping to whichever side is worse", () => {
    // A cell with more room below it than above, but a menu tall enough
    // that it doesn't fully fit in *either* direction (e.g. many teams'
    // rows in a short popup window). The old logic ("place below; flip to
    // above the moment below doesn't fit") always flipped here regardless
    // of which side actually had more room, landing this case at the very
    // top of the viewport (margin, 4px) — hundreds of pixels from a cell
    // that isn't even near the top. Comparing space directly instead picks
    // "below" (603px of room vs. 296px above) and clamps it against the
    // viewport's bottom edge, landing much closer to the cell.
    const cellRect = { top: 300, bottom: 340, left: 100, right: 200 };
    const menuSize = { width: 200, height: 700 };

    const { top } = computeMenuPosition(cellRect, menuSize, viewport, margin);

    expect(top).toBe(viewport.height - margin - menuSize.height); // 243
    expect(top).toBeGreaterThan(margin);
  });

  it("clamps left so the menu never runs off the right edge of the viewport", () => {
    const cellRect = { top: 100, bottom: 140, left: 850, right: 895 };
    const menuSize = { width: 200, height: 100 };

    const { left } = computeMenuPosition(cellRect, menuSize, viewport, margin);

    expect(left).toBe(cellRect.right - menuSize.width);
    expect(left + menuSize.width).toBeLessThanOrEqual(viewport.width);
  });
});
