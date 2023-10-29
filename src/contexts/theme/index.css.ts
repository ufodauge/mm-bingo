import { themeContract } from "@/const/theme/contract.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const container = style({
  display: "flex",
  flexDirection: "column",
  backgroundColor: themeContract.base,
  transitionDuration: ".2s",
  transitionTimingFunction: "ease-in-out",
  minWidth: "100%",
  minHeight: "100vh",
});

globalStyle("*", {
  fontFamily: `"Noto Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
  fontSize: "16px",
});

globalStyle("body", {
  margin: "0",
});

globalStyle("html", {
  minWidth: "fit-content",
});
