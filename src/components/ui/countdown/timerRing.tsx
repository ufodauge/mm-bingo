import { css, useTheme } from "@emotion/react";

type Props = { seconds: number };

const TIME_LIMIT = 60 * 3;
const FULL_DASH_ARRAY = 283;

const calculateTimeFraction = (seconds: number) => {
  if (seconds > TIME_LIMIT) {
    return TIME_LIMIT;
  }
  return seconds / TIME_LIMIT;
};

const getCircleDashArray = (seconds: number) => {
  return `${(calculateTimeFraction(seconds) * FULL_DASH_ARRAY).toFixed(0)} 283`;
};

const TimerRing: React.FC<Props> = ({ seconds }) => {
  const theme = useTheme();

  const style = css({
    color: theme.primary,

    /* Just as thick as the original ring */
    strokeWidth: "8px",

    /* Rounds the line endings to create a seamless circle */
    strokeLinecap: "round",

    /* Makes sure the animation starts at the top of the circle */
    transform: "rotate(90deg)",
    transformOrigin: "center",

    /* One second aligns with the speed of the countdown timer */
    transition: "1s ease-out all",

    /* Allows the ring to change color when the color value updates */
    stroke: "currentColor",
  });
  return (
    <path
      stroke-dasharray={getCircleDashArray(seconds)}
      css={style}
      d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
    ></path>
  );
};

export default TimerRing;
