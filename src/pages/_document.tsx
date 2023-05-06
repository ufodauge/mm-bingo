import { Global, css } from "@emotion/react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const style = css({
    margin: "0",
  });

  const globalStyle = css({
    "*": {
      fontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      fontSize: "16px"
    },
  });

  return (
    <Html lang="en">
      <Global styles={globalStyle} />
      <Head />
      <body css={style}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
