// https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/

import React, { useState } from "react";

import dayjs, { Dayjs } from "dayjs";
import { CountdownTemplate } from "./CountdownTemplate";
import useInterval from "@/lib/hooks/useInterval";

type Props = { target: Dayjs | null };

const Countdown: React.FC<Props> = ({ target }) => {
  const [remains, setRemains] = useState<Dayjs | null>(null);
  useInterval(() => {
    if (target === null) return;
    setRemains(dayjs(target.diff()));
  }, 250);

  if (target === null || remains === null) {
    return <CountdownTemplate seconds={0} text="--:--:--" />;
  }

  const days    = target.diff(undefined, "days");
  const hours   = target.diff(undefined, "hours");
  const seconds = target.diff(undefined, "seconds");

  const text = (() => {
    if (days > 0) {
      return remains.format("DD [Days]");
    } else if (hours > 0) {
      return remains.format("HH:mm:ss");
    }
    return remains.format("mm:ss");
  })();

  return <CountdownTemplate seconds={seconds} text={text} />;
};

export default Countdown;
