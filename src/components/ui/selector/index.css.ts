import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const container = style({
  width          : "100%",
  backgroundColor: themeContract.baseVariant,
  color          : themeContract.baseContent,
  borderColor    : themeContract.baseVariant,
  borderStyle    : "solid",
  borderWidth    : "2px",
  borderRadius   : "10px",
  paddingInline  : "1rem",
  transition     : "inherit",
});