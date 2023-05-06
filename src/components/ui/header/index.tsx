import { ReactNode } from "react";

import { css } from "@emotion/react";

import Title from "./title";

type Props = { text: string; children?: ReactNode };

const Header: React.FC<Props> = ({ text, children }) => {
  const navbar = css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5em",
    minHeight: "4em",
    width: "-webkit-fill-available",
    transitionProperty: "background-color",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease-in-out",
  });

  const navbarStart = css({
    display: "inline-flex",
    width: "50%",
    paddingInlineStart: "1em",
    justifyContent: "flex-start",
  });

  const navbarEnd = css({
    display: "inline-flex",
    width: "50%",
    justifyContent: "flex-end",
    marginInline: "1em",
  });

  return (
    <div css={navbar}>
      <div css={navbarStart}>
        <Title text={text} />
      </div>
      <div css={navbarEnd}>{children}</div>
    </div>
  );
};

export default Header;
