import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const main = style({
  display       : "flex",
  flexWrap      : "wrap",
  justifyContent: "center",
  gap           : "1.5em",
});

export const lang = style({
  appearance     : "none",
  width          : "8em",
  height         : "2.8em",
  padding        : ".4em calc(.8em + 30px) .4em .8em",
  border         : "1px solid #cccccc",
  borderRadius   : "25px",
  backgroundColor: themeContract.baseVariant,
  color          : themeContract.baseContent,
  fontSize       : "1em",
  cursor         : "pointer",
});
