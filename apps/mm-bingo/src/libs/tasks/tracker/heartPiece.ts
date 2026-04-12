import * as vb from "valibot";

export const trackerHeartPieceParamsSchema = vb.object({
  max: vb.pipe(vb.number(), vb.integer()),
  init: vb.fallback(vb.optional(vb.pipe(vb.number(), vb.integer())), 13),
});

export type TrackerHeartPieceParams = vb.InferOutput<
  typeof trackerHeartPieceParamsSchema
>;
