import { css, useTheme } from "@emotion/react";

type Props = { text: string };

const Header: React.FC<Props> = ({ text }) => {
  const theme = useTheme();
  const style = css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.neutral,
    color: theme.neutralContent,
    fontWeight: "bold",
    fontSize: "1.2em",
    userSelect: "none",
  });
  
  return <div css={style}>{text}</div>;
};

export default Header;
