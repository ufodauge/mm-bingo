/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";

import CountdownUI from "@/components/ui/countdown";
import { SEP } from "@/const/crypto";
import { useThemeValue } from "@/contexts/theme";
import { decrypt } from "@/lib/encoder";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { CountdownQuery } from "@/types/query/countdown";
import { MainPageQuery } from "@/types/query/mainpage";

const Countdown = React.memo(function Countdown() {
  const { isReady, getQuery, updateQuery } = useRouterPush<
    CountdownQuery,
    MainPageQuery
  >();

  const [count, setCount] = useState(0);
  // const [timerRef, setTimerRef] = useState<NodeJS.Timer | undefined>();

  const { themeName } = useThemeValue();

  useEffect(() => {
    if (!isReady) return;

    const { query } = getQuery();

    const decrypted = decrypt(query.code, query.key);
    const [seed, releaseTime] = decrypted.split(SEP);
    const targetTime = new Date(Number(releaseTime)).getTime();

    let timerRef = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        clearInterval(timerRef);
        console.log("???")
        updateQuery("/", {
          seed: Number(seed),
          lang: query.lang,
          theme: themeName,
        });
      } else {
        setCount(distance);
      }
    }, 10);
  }, [isReady, themeName]);

  return count !== 0 ? <CountdownUI remains={count} /> : <></>;
});

export default Countdown;
