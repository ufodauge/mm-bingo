import { Theme } from "@emotion/react";
import { DefaultTheme } from "./default";

export const DarkTheme: Theme = {
  ...DefaultTheme,
  primary: "#3ed2ee",
  primaryVariant: "#32b8d1",
  secondary: "#f8faf5",
  secondaryVariant: "#ecedeb",
  base: "#424765",
  baseVariant: "#313348",
  accent: "#f06f3c",
  accentVariant: "#cf5b2d",
  neutral: "#80899a",

  primaryContent: "#ffffff",
  secondaryContent: "#000000",
  baseContent: "#ffffff",
  accentContent: "#ffffff",
  neutralContent: "#ffffff",

  highlightColor1: "#484d68",
  highlightColor2: "#3ed2ee",
  highlightColor3: "#cf2ba8",
  highlightColor4: "#f06f3c",

  highlightColor1Variant: "#313348",
  highlightColor2Variant: "#47c5df",
  highlightColor3Variant: "#bd349d",
  highlightColor4Variant: "#dd6d40",

  highlightContent: "#ffffff",
};
