import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const css = style({
  fontSize       : "large",
  backgroundColor: themeContract.baseVariant,
  color          : themeContract.baseContent,
  fontWeight     : "normal",
  borderRadius   : "4px",
  borderWidth    : "1px",

  ":hover": {
    color      : themeContract.primaryContent,
    borderColor: themeContract.primary,
  },
});
