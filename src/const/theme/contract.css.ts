import { createThemeContract } from "@vanilla-extract/css";

export const themeContract = createThemeContract({
  primary         : null,
  primaryVariant  : null,
  secondary       : null,
  secondaryVariant: null,
  base            : null,
  baseVariant     : null,
  accent          : null,
  accentVariant   : null,
  neutral         : null,

  primaryContent  : null,
  secondaryContent: null,
  baseContent     : null,
  accentContent   : null,
  neutralContent  : null,

  highlightColor1: null,
  highlightColor2: null,
  highlightColor3: null,
  highlightColor4: null,

  highlightColor1Variant: null,
  highlightColor2Variant: null,
  highlightColor3Variant: null,
  highlightColor4Variant: null,

  highlightContent: null,
});
