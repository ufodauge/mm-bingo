import * as vb from "valibot";

export const trackerCounterParamsSchema = vb.object({
  max: vb.pipe(vb.number(), vb.integer()),
  init: vb.optional(vb.pipe(vb.number(), vb.integer())),
  icon: vb.optional(vb.string()),
});

export type TrackerCounterParams = vb.InferOutput<
  typeof trackerCounterParamsSchema
>;
