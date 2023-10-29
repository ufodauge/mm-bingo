// https://gist.github.com/akhrszk/776e7f136f8c167d9e66adff1a2d63e5
import { useEffect, useRef, useState } from "react";

type Control = {
  start: () => void;
  stop : () => void;
};

type State = "RUNNING" | "STOPPED";

type Fn = () => void;

export const useInterval = (
  fn: Fn,
  interval: number,
  autostart = true
): [State, Control] => {
  const onUpdateRef = useRef<Fn>();
  const [state, setState] = useState<State>("STOPPED");
  const start = () => {
    setState("RUNNING");
  };

  const stop = () => {
    setState("STOPPED");
  };

  useEffect(() => {
    onUpdateRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (autostart) {
      setState("RUNNING");
    }
  }, [autostart]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;

    if (state === "RUNNING") {
      timerId = setInterval(() => {
        onUpdateRef.current?.();
      }, interval);
    } else {
      timerId && clearInterval(timerId);
    }
    
    return () => {
      timerId && clearInterval(timerId);
    };
  }, [interval, state]);

  return [state, { start, stop }];
};

export default useInterval;
