import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const defaultStyle = style({
  padding                 : 0,
  border                  : themeContract.base,
  borderRadius            : "10px",
  cursor                  : "pointer",
  display                 : "inline-flex",
  flexWrap                : "wrap",
  alignItems              : "center",
  justifyContent          : "center",
  alignContent            : "center",
  userSelect              : "none",
  fontWeight              : "bold",
  backgroundColor         : themeContract.neutral,
  color                   : themeContract.neutralContent,
  transitionProperty      : "color background-color font-weight",
  transitionDuration      : "0.2s",
  transitionTimingFunction: "ease-in-out",

  ":hover": {
    backgroundColor: themeContract.primary,
    color          : themeContract.primaryContent,
  },

  ":active": {
    backgroundColor: themeContract.primaryVariant,
    color          : themeContract.primaryContent,
  },
});

export const ghost = style({
  backgroundColor: "transparent",
  color          : themeContract.baseContent,

  ":hover": {
    backgroundColor: themeContract.primary,
    color          : themeContract.primaryContent,
  },
  ":active": {
    backgroundColor: themeContract.primaryVariant,
    color          : themeContract.primaryContent,
  },
});

export const outlined = style({
  backgroundColor: themeContract.base,
  borderStyle    : "solid",
  borderWidth    : "2px",
  borderColor    : themeContract.neutral,
  color          : themeContract.baseContent,

  ":hover": {
    backgroundColor: themeContract.primary,
    color          : themeContract.primaryContent,
  },

  ":active": {
    backgroundColor: themeContract.primaryVariant,
    color          : themeContract.primaryContent,
  },
});
