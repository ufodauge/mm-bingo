import { css } from "@emotion/react";
import TimerRing from "./timerRing";

type Props = {seconds: number};

const TimerCircle: React.FC<Props> = ({ seconds }) => {
  const style = {
    baseTimerCircle: css({
      fill: "none",
      stroke: "none",
    }),
    baseTimerPathElapsed: css({
      strokeWidth: "7px",
      stroke: "grey",
    }),
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g css={style.baseTimerCircle}>
        <circle css={style.baseTimerPathElapsed} cx="50" cy="50" r="45" />
        <TimerRing seconds={seconds} />
      </g>
    </svg>
  );
};

export default TimerCircle;
