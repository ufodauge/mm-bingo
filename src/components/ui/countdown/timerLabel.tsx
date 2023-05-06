import { css, useTheme } from "@emotion/react";

type Props = { text: string };

const TimerLabel: React.FC<Props> = ({ text }) => {
  const theme = useTheme();
  const style = css({
    position: "absolute",

    /* Size should match the parent container */
    width: "inherit",
    height: "inherit",

    /* Keep the label aligned to the top */
    top: "0",

    /* Create a flexible box that centers content vertically and horizontally */
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    /* Sort of an arbitrary number; adjust to your liking */
    fontSize: "48px",
    color: theme.baseContent,
  });

  return <span css={style}>{text}</span>;
};

export default TimerLabel;
