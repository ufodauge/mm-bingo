/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

import CountdownUI from "@/components/ui/countdown";
import { SEP } from "@/const/crypto";
import { decrypt } from "@/lib/encoder";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { CountdownQuery } from "@/types/query/countdown";
import { MainPageQuery } from "@/types/query/mainpage";
import { isThemeName } from "@/types/theme/theme";

const Countdown = React.memo(function Countdown() {
  const { isReady, getQuery, updateQuery } = useRouterPush<
    CountdownQuery,
    MainPageQuery
  >();

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isReady) return;

    const { query } = getQuery();

    const decrypted = decrypt(query.code, query.key);
    const [seed, releaseTime] = decrypted.split(SEP);
    const targetTime = new Date(Number(releaseTime)).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;
      const themeName = isThemeName(query.theme) ? query.theme : "light";

      if (distance <= 0) {
        clearInterval(timer);
        updateQuery("/", {
          seed: Number(seed),
          lang: query.lang,
          theme: themeName,
        });
      } else {
        setCount(distance);
      }
    }, 10);
  }, [isReady]);

  return count !== 0 ? <CountdownUI remains={count} /> : <></>;
});

export default Countdown;
