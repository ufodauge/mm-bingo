import * as vb from "valibot";
import { trackerCounterParamsSchema } from "../tracker/counter";
import { trackerTogglerParamsSchema } from "../tracker/toggler";

export const taskSourceListSchema = vb.array(
  vb.object({
    difficulty: vb.pipe(vb.number(), vb.integer()),
    contents: vb.record(vb.string(), vb.string()),
    tag: vb.array(vb.string()),
    trackers: vb.array(
      vb.variant("type", [
        vb.object({
          type: vb.literal("counter"),
          properties: trackerCounterParamsSchema,
        }),
        vb.object({
          type: vb.literal("toggler"),
          properties: trackerTogglerParamsSchema,
        }),
      ]),
    ),
  }),
);
