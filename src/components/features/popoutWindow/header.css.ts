import { themeContract } from "@/const/theme/contract.css";
import { style } from "@vanilla-extract/css";

export const container = style({
    display        : "flex",
    justifyContent : "center",
    alignItems     : "center",
    backgroundColor: themeContract.neutral,
    color          : themeContract.neutralContent,
    fontSize       : ".9em",
    userSelect     : "none",
});
