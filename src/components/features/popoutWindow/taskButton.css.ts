import { themeContract } from "@/const/theme/contract.css";
import { keyframes, style } from "@vanilla-extract/css";

export const animation = keyframes({
  "0%"  : { boxShadow: `0 0 0 0 ${themeContract.primary}` },
  "100%": { boxShadow: `0 0 0 8px ${themeContract.primary}00` },
});

export const base = style({
  display           : "flex",
  justifyContent    : "center",
  alignItems        : "center",
  flexDirection     : "column",
  cursor            : "pointer",
  color             : themeContract.highlightContent,
  transitionDuration: ".2s",
  userSelect        : "none",
  padding           : ".8em",

  ":hover": {
    borderColor       : themeContract.primary,
    color             : themeContract.highlightContent,
    backgroundPosition: "right center",
    backgroundSize    : "auto",
    animationName     : animation,
    animationDuration : "1s",
    zIndex            : "10",
  },
});

export const taskText = style({
  display       : "flex",
  justifyContent: "center",
  alignItems    : "center",
  width         : "100%",
  margin        : ".3em",
  fontWeight    : "bold",
  fontSize      : "1.2em",
});

export const highlights = [
  style({
    backgroundColor: themeContract.highlightColor1,

    ":hover": {
      backgroundColor: themeContract.highlightColor1Variant,
    },
  }),
  style({
    backgroundColor: themeContract.highlightColor2,

    ":hover": {
      backgroundColor: themeContract.highlightColor2Variant,
    },
  }),
  style({
    backgroundColor: themeContract.highlightColor3,

    ":hover": {
      backgroundColor: themeContract.highlightColor3Variant,
    },
  }),
  style({
    backgroundColor: themeContract.highlightColor4,

    ":hover": {
      backgroundColor: themeContract.highlightColor4Variant,
    },
  }),
];
