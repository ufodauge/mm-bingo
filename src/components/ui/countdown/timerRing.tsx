import React from "react";
import { timerRing } from "./index.css";

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

type Props = { seconds: number };

const TimerRing: React.FC<Props> = ({ seconds }) => {
  return (
    <path
      strokeDasharray={getCircleDashArray(seconds)}
      className={timerRing}
      d={`M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0`}
    ></path>
  );
};

export default TimerRing;
