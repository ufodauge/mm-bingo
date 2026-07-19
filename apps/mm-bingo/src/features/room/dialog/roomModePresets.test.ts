import { describe, expect, it } from "vitest";

import { findSimpleModePreset, SIMPLE_MODE_PRESETS } from "./roomModePresets";

describe("findSimpleModePreset", () => {
  it("matches classic + exclusive to lockout", () => {
    expect(findSimpleModePreset("classic", "exclusive")?.id).toBe("lockout");
  });

  it("matches classic + shared to teamBlackout", () => {
    expect(findSimpleModePreset("classic", "shared")?.id).toBe("teamBlackout");
  });

  it("matches othello only when passed its one real claimSharing value", () => {
    // findSimpleModePreset does a direct lookup, not a resolving one — a
    // caller working from a real RoomState is expected to already have a
    // definite value (via effectiveClaimSharing, since RoomState itself no
    // longer carries a claimSharing field at all for othello — see its own
    // comment), not pass through something that was never really a choice.
    expect(findSimpleModePreset("othello", "exclusive")?.id).toBe("othello");
    expect(findSimpleModePreset("othello", "shared")).toBeUndefined();
  });

  it("matches hidden + exclusive to hiddenStart", () => {
    expect(findSimpleModePreset("hidden", "exclusive")?.id).toBe("hiddenStart");
  });

  it("returns undefined for a combination no preset covers", () => {
    // Only reachable via the advanced picker (e.g. hidden + shared) — the
    // simple picker has no matching option and should show none selected
    // rather than guessing.
    expect(findSimpleModePreset("hidden", "shared")).toBeUndefined();
  });

  it("every preset id is unique and resolves back to itself", () => {
    const ids = SIMPLE_MODE_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const preset of SIMPLE_MODE_PRESETS) {
      expect(findSimpleModePreset(preset.mode, preset.claimSharing)?.id).toBe(
        preset.id,
      );
    }
  });
});
