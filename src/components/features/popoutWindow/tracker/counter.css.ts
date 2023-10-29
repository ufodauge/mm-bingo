import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const container = style({
  padding      : ".3em",
  paddingInline: ".8em",

  ":hover": {
    backgroundColor: themeContract.baseVariant,
    color          : themeContract.baseContent,
  },
});

export const text = style({
  display       : "flex",
  flexDirection : "row",
  justifyContent: "center",
  alignItems    : "center",
  height        : "2em",
});

export const textSub = style({
  color: themeContract.neutral,
});

export const textMain = style({
  padding : "",
  fontSize: "1.2em",
});

export const textSlash = style({
  paddingInlineStart: "0.5em",
});

export const image = style({
  width : "1.5em",
  height: "1.5em",
  margin: ".375em",
});
