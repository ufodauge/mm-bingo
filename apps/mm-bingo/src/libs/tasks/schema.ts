import * as vb from "valibot";

import { trackerCounterParamsSchema } from "../tracker/counter";
import { trackerHeartPieceParamsSchema } from "../tracker/heartPiece";
import { trackerTogglerParamsSchema } from "../tracker/toggler";

export const taskSourceListSchema = vb.array(
  vb.object({
    difficulty: vb.pipe(
      vb.number(),
      vb.integer(),
      vb.minValue(1),
      vb.maxValue(25),
    ),
    contents: vb.record(vb.string(), vb.string()),
    tag: vb.array(vb.string()),
    // Calibrated by scripts/calibrateTaskWeights.ts — optional so hand-
    // edited/newly-added tasks still parse (see TaskSource.weight), but
    // scripts/checkTaskWeights.ts (run in CI) treats a missing one as a
    // failure, not a silently-accepted default.
    weight: vb.optional(vb.pipe(vb.number(), vb.minValue(0))),
    trackers: vb.array(
      vb.variant("type", [
        vb.object({
          type: vb.literal("counter"),
          properties: trackerCounterParamsSchema,
        }),
        vb.object({
          type: vb.literal("heart-piece"),
          properties: trackerHeartPieceParamsSchema,
        }),
        vb.object({
          type: vb.literal("toggler"),
          properties: trackerTogglerParamsSchema,
        }),
      ]),
    ),
  }),
);
