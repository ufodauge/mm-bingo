import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css"

export const navbar = style({
  display                 : "inline-flex",
  alignItems              : "center",
  justifyContent          : "center",
  padding                 : "0.5em",
  minHeight               : "4em",
  width                   : "-webkit-fill-available",
  transitionProperty      : "background-color",
  transitionDuration      : "0.2s",
  transitionTimingFunction: "ease-in-out",
});

export const navbarStart = style({
  display           : "inline-flex",
  width             : "50%",
  paddingInlineStart: "1em",
  justifyContent    : "flex-start",
});

export const navbarEnd = style({
  display       : "inline-flex",
  width         : "50%",
  justifyContent: "flex-end",
  paddingInline : "1em",
})

export const title = style({
  fontSize                : "x-large",
  fontWeight              : "bold",
  color                   : themeContract.baseContent,
  transitionProperty      : "color",
  transitionDuration      : "0.2s",
  transitionTimingFunction: "ease-in-out",
})