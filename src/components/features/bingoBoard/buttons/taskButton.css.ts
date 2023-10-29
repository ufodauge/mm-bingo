import { themeContract } from "@/const/theme/contract.css";
import { style, keyframes } from "@vanilla-extract/css";

const targetedAnimation = keyframes({
  "0%"  : { boxShadow: `0 0 0 0 ${themeContract.primary}` },
  "100%": { boxShadow: `0 0 0 8px ${themeContract.primary}00` },
});

export const highlight = style({
  borderColor       : themeContract.primary,
  color             : themeContract.highlightContent,
  backgroundPosition: "right center",
  backgroundSize    : "200% auto",
  animationName     : targetedAnimation,
  animationDuration : ".5s",
  zIndex            : "10",

  ":hover": {
    color : themeContract.highlightContent,
  },
});

export const base = style({
  color      : themeContract.highlightContent,
  borderColor: "transparent",
  fontWeight : "normal",
});

export const targeted = style({
  borderColor: themeContract.primary,
  
  ":hover": {
    color : themeContract.highlightContent,
  },
})

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
