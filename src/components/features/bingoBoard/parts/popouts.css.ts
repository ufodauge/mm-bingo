import { style } from "@vanilla-extract/css";
import { gapPx } from "../index.css";

export const container = style({
  display: "grid",
  gap    : `${gapPx}px`,
});

export const popoutCols = style({
  gridTemplateRows: "inherit",
})