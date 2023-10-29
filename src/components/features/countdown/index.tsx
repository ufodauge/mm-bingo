/* eslint-disable react-hooks/exhaustive-deps */
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';

import CountdownUI from '@/components/ui/countdown';
import { SEP } from '@/const/crypto';
import { useThemeValue } from '@/contexts/theme';
import { decrypt } from '@/lib/encoder';
import useInterval from '@/lib/hooks/useInterval';
import { useRouterPush } from '@/lib/hooks/useRouterPush';
import { CountdownQuery } from '@/types/query/countdown';
import { MainPageQuery } from '@/types/query/mainpage';

const Countdown = () => {
  const { isReady, getQuery, updateQuery } = useRouterPush<
    CountdownQuery,
    MainPageQuery
  >();

  const [count, setCount] = useState<Dayjs | null>(null);
  const [seed, setSeed]   = useState<number | null>(null);
  const [lang, setLang]   = useState<string | null>(null);

  const { themeName } = useThemeValue();

  useInterval(() => {
    if (count === null) return;

    if (count.diff(undefined, "seconds", true) < 1) {
      updateQuery("/", {
        seed : Number(seed),
        lang : lang ?? "en",
        theme: themeName,
      });
    }
  }, 250);

  useEffect(() => {
    if (!isReady) return;

    const { query } = getQuery();

    const decrypted          = decrypt(query.code, query.key);
    const [seed, targetTime] = decrypted.split(SEP);

    setCount(dayjs(targetTime));
    setSeed(Number(seed));
    setLang(query.lang);
  }, [isReady, themeName]);

  return <CountdownUI target={count} />;
};

export default Countdown;
