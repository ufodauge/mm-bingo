import React from "react";
import { timerLabel } from "./index.css";

type Props = { text: string };

const TimerLabel: React.FC<Props> = ({ text }) => {
  return <span className={timerLabel}>{text}</span>;
};

export default TimerLabel;
