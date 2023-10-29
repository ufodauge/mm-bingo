import { style } from "@vanilla-extract/css";

export const header = style({
  zIndex: 50,
});

export const main = style({
  width         : "100%",
  height        : "100vh",
  display       : "flex",
  flexDirection : "column",
  justifyContent: "center",
  alignItems    : "center",
  position      : "absolute",
});
