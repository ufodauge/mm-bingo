import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const container = style({
  position: "relative",
  width   : "inherit",
  height  : "inherit",
});

export const timerRing = style({
  color          : themeContract.primary,
  strokeWidth    : "8px",
  strokeLinecap  : "round",
  transform      : "rotate(90deg)",
  transformOrigin: "center",
  transition     : "1s ease-out all",
  stroke         : "currentColor",
});

export const timerLabel = style({
  position      : "absolute",
  width         : "inherit",
  height        : "inherit",
  top           : "0",
  display       : "flex",
  alignItems    : "center",
  justifyContent: "center",
  fontSize      : "48px",
  color         : themeContract.baseContent,
});

export const baseTimerCircle = style({
  fill  : "none",
  stroke: "none",
});

export const baseTimerPathElapsed = style({
  strokeWidth: "7px",
  stroke     : "grey",
});