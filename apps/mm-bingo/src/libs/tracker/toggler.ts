import * as vb from "valibot";

export const trackerTogglerParamsSchema = vb.object({
  icons: vb.optional(vb.array(vb.string())),
});

export type TrackerTogglerParams = vb.InferOutput<
  typeof trackerTogglerParamsSchema
>;
