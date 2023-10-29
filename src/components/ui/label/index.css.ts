import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const container = style({
  display       : "flex",
  justifyContent: "center",
  alignItems    : "center",
  transition    : "inherit",
});

export const text = style({
  color     : themeContract.baseContent,
  transition: "inherit",
  fontWeight: "bold"
});
