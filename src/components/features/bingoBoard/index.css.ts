import { style } from "@vanilla-extract/css";

export const minCellSize    = 40;
export const normalCellSize = 120;
export const gapPx          = 2;

export const container = style({
  display: "grid",
  gap    : `${gapPx}px`,
  margin : "1em",
});
