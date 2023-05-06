export type ColorCode = `#${string}`;

declare module "@emotion/react" {
  export interface Theme {
    primary: ColorCode;
    primaryVariant: ColorCode;
    secondary: ColorCode;
    secondaryVariant: ColorCode;
    base: ColorCode;
    baseVariant: ColorCode;
    accent: ColorCode;
    accentVariant: ColorCode;
    neutral: ColorCode;

    primaryContent: ColorCode;
    secondaryContent: ColorCode;
    baseContent: ColorCode;
    accentContent: ColorCode;
    neutralContent: ColorCode;

    highlightColor1: ColorCode;
    highlightColor2: ColorCode;
    highlightColor3: ColorCode;
    highlightColor4: ColorCode;

    highlightColor1Variant: ColorCode;
    highlightColor2Variant: ColorCode;
    highlightColor3Variant: ColorCode;
    highlightColor4Variant: ColorCode;

    highlightContent: ColorCode;
  }
}
