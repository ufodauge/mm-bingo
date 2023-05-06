import { style } from "@vanilla-extract/css";

const GRID_COLUMNS = 2;
const GRID_ROWS    = 6;

export const container = style({
  display                 : "grid",
  gridTemplateColumns     : `repeat(${GRID_COLUMNS}, 1fr)`,
  gridTemplateRows        : `repeat(${GRID_ROWS}, 3em)`,
  gap                     : "0.75em",
  width                   : "100%",
  transitionDuration      : ".2s",
  transitionTimingFunction: "ease-in-out",
});

export const columnSpanAll = style({
  gridColumn: `1 / span ${GRID_COLUMNS}`
})