import { style } from "@vanilla-extract/css";

export const container = style({
    display         : "grid",
    gridTemplateRows: "2em 1fr",
    minHeight       : "100vh",
});
