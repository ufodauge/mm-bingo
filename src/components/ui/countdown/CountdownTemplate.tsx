import React from "react";
import TimerCircle from "./timerCircle";
import TimerLabel from "./timerLabel";
import { container } from "./index.css";

type Props = {
  seconds: number;
  text: string;
};

export const CountdownTemplate = ({ seconds, text }: Props) => (
  <div className={container}>
    <TimerCircle seconds={seconds} />
    <TimerLabel text={text} />
  </div>
);
