// https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/

import { css } from "@emotion/react";
import TimerCircle from "./timerCircle";
import TimerLabel from "./timerLabel";

type Props = { remains: number };

const Countdown: React.FC<Props> = ({ remains }) => {
  const days = Math.floor(remains / (1000 * 60 * 60 * 24));
  const hours = String(
    Math.floor((remains % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  ).padStart(2, "0");
  const minutes = String(
    Math.floor((remains % (1000 * 60 * 60)) / (1000 * 60))
  ).padStart(2, "0");
  const seconds = String(Math.floor((remains % (1000 * 60)) / 1000)).padStart(
    2,
    "0"
  );
  const milliseconds = String(Math.floor(remains / 10))
    .slice(-2)
    .padEnd(2, "0");

  const remainsAsSecond = Math.floor(remains / 1000);

  const text = (() => {
    if (days !== 0) {
      return `${days}D ${hours}:${minutes}:${seconds}`;
    } else if (minutes !== "00") {
      return `${hours}:${minutes}:${seconds}`;
    }
    return `${minutes}:${seconds}.${milliseconds}`;
  })();

  const style = {
    baseTimer: css({
      position: "relative",
      width: "inherit",
      height: "inherit",
    }),
  };

  return (
    <div css={style.baseTimer}>
      <TimerCircle seconds={remainsAsSecond} />
      <TimerLabel text={text} />
    </div>
  );
};

export default Countdown;
