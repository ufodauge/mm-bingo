import { createTheme } from "@vanilla-extract/css";
import { themeContract } from "./contract.css";

export const lightThemeClass = createTheme(themeContract, {
  primary         : "#5bdaf3",
  primaryVariant  : "#49cae0",
  secondary       : "#23c9a5",
  secondaryVariant: "#1db493",
  base            : "#f5f5f5",
  baseVariant     : "#e8e8e8",
  accent          : "#f37848",
  accentVariant   : "#e06635",
  neutral         : "#bfc6d3",

  primaryContent  : "#ffffff",
  secondaryContent: "#ffffff",
  baseContent     : "#4b4b4b",
  accentContent   : "#ffffff",
  neutralContent  : "#ffffff",

  highlightColor1: "#f1f1f1",
  highlightColor2: "#67dff7",
  highlightColor3: "#e6a5f3",
  highlightColor4: "#f09c7b",

  highlightColor1Variant: "#e5e5e5",
  highlightColor2Variant: "#57cfe7",
  highlightColor3Variant: "#d695e3",
  highlightColor4Variant: "#e08c6b",

  highlightContent: "#464646",
});
