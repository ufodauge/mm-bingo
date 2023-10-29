import { style } from "@vanilla-extract/css";

export const container = style({
  display      : "flex",
  flexDirection: "row",
});

export const base = style({
  transitionDuration      : ".15s",
  transitionTimingFunction: "ease-out",

  ":hover": {
    outlineStyle: "solid",
    outlineWidth: "1px",
    borderRadius: "4px",
  },
});

export const image = style({
  width : "1.8em",
  height: "1.6em",
  margin: ".1em",
});