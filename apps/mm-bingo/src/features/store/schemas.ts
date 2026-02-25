import * as vb from "valibot";

export const boardSizeSchema = vb.fallback(
  vb.pipe(vb.number(), vb.minValue(3), vb.maxValue(9)),
  5,
);

export const boardSizes = [3, 4, 5, 6, 7, 8, 9];

{
  // static assertion
  for (const size of boardSizes) {
    vb.parse(boardSizeSchema, size);
  }
}

export const allowSameElementOccurrenceSchema = vb.fallback(
  vb.boolean(),
  false,
);

export type BoardSize = vb.InferOutput<typeof boardSizeSchema>;

export const gameStatusSchema = vb.looseObject({
  seed: vb.fallback(vb.number(), () => Math.trunc(Math.random() * 1000000)),
});

export type GameStatus = vb.InferOutput<typeof gameStatusSchema>;

export const defaultGameStatus = vb.getFallbacks(gameStatusSchema);
