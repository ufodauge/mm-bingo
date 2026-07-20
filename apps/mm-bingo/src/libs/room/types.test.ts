import { describe, expect, it } from "vitest";

import { effectiveClaimSharing, type RoomState } from "./types";

// Only the fields effectiveClaimSharing actually looks at matter here — the
// rest are typed but never read, so the `as` narrows the object literal to
// each RoomState branch without needing to fill in every unrelated field.
const stateWith = (
  mode: RoomState["mode"],
  claimSharing?: "exclusive" | "shared",
) => ({ mode, claimSharing }) as RoomState;

describe("effectiveClaimSharing", () => {
  it("is always exclusive for othello, which carries no claimSharing field at all", () => {
    expect(effectiveClaimSharing(stateWith("othello"))).toBe("exclusive");
  });

  it("passes through the stored value for every other mode", () => {
    expect(effectiveClaimSharing(stateWith("classic", "shared"))).toBe(
      "shared",
    );
    expect(effectiveClaimSharing(stateWith("classic", "exclusive"))).toBe(
      "exclusive",
    );
    expect(effectiveClaimSharing(stateWith("hidden", "shared"))).toBe("shared");
  });
});
