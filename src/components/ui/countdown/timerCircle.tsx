import TimerRing from "./timerRing";
import React from "react";
import { baseTimerCircle, baseTimerPathElapsed } from "./index.css";

type Props = { seconds: number };

const TimerCircle: React.FC<Props> = ({ seconds }) => {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g className={baseTimerCircle}>
        <circle className={baseTimerPathElapsed} cx="50" cy="50" r="45" />
        <TimerRing seconds={seconds} />
      </g>
    </svg>
  );
};

export default TimerCircle;
