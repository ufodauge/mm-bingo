import { style } from "@vanilla-extract/css";

export const BUTTON_HEIGHT = 3;
export const BUTTON_WIDTH  = 3;

export const container = style({
  height      : `${BUTTON_HEIGHT}rem`,
  width       : `${BUTTON_WIDTH}rem`,
  borderRadius: "9999px",
});
