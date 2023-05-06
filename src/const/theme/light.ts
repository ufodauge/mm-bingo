import { Theme } from "@emotion/react";
import { DefaultTheme } from "./default";

export const LightTheme: Theme = {
  ...DefaultTheme,
  primary: "#5bdaf3",
  primaryVariant: "#49cae0",
  secondary: "#23c9a5",
  secondaryVariant: "#1db493",
  base: "#f5f5f5",
  baseVariant: "#e8e8e8",
  accent: "#f37848",
  accentVariant: "#e06635",
  neutral: "#bfc6d3",

  primaryContent: "#ffffff",
  secondaryContent: "#ffffff",
  baseContent: "#4b4b4b",
  accentContent: "#ffffff",
  neutralContent: "#ffffff",

  highlightColor1: "#f1f1f1",
  highlightColor2: "#67dff7",
  highlightColor3: "#e6a5f3",
  highlightColor4: "#f09c7b",

  highlightColor1Variant: "#f5f5f5",
  highlightColor2Variant: "#67dff7",
  highlightColor3Variant: "#e6a5f3",
  highlightColor4Variant: "#f09c7b",

  highlightContent: "#464646",
};
