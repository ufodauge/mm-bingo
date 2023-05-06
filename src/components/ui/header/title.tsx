import { useTheme, css } from "@emotion/react";

type Props = { text: string };

const Title: React.FC<Props> = ({ text }) => {
  const theme = useTheme();

  const style = css({
    fontSize: "x-large",
    fontWeight: "bold",
    color: theme.baseContent,
    transitionProperty: "color",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease-in-out",
  });

  return <span css={style}>{text}</span>;
};

export default Title;
