import { style } from "@vanilla-extract/css";

export const container = style({
  display: "grid",
});

export const popoutCols = style({
  gridTemplateRows: "inherit",
})