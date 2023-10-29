import { globalStyle } from "@vanilla-extract/css";

globalStyle("html::-webkit-scrollbar", {
  display: "none",
});

globalStyle("html", {
  scrollbarWidth: "none",
});
