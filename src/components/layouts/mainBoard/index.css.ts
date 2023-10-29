import { style } from "@vanilla-extract/css";

export const container = style({
  display      : "flex",
  flexDirection: "column",
  gap          : "1em",
  width        : "36em",
  alignItems   : "baseline",
  padding      : "2rem",
});
