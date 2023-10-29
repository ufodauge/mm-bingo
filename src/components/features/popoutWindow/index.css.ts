import { HEADER_PX } from "@/const/popupWindowFeatures";
import { globalStyle, style } from "@vanilla-extract/css";

export const container = style({
  display: "grid",
  gridTemplateRows: `${HEADER_PX}px 1fr`,
  minHeight: "100vh"
});

globalStyle("html::-webkit-scrollbar", {
  display: "none",
});

globalStyle("html", {
  scrollbarWidth: "none",
});
