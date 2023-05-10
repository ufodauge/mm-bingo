import { css } from "@emotion/react";
import React from "react";
import { ReactNode } from "react";

type Props = { children: ReactNode };

const Copyright = React.memo<Props>(function Copyright({ children }) {
  const style = css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  });
  return <div css={style}>{children}</div>;
});

export default Copyright;
