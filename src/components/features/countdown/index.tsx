/* eslint-disable react-hooks/exhaustive-deps */
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  const [targetTime, setTargetTime] = useState<Dayjs | undefined>();
  const [seed, setSeed] = useState<number | undefined>();
  const [lang, setLang] = useState<string | undefined>();

  const { themeName } = useThemeValue();

  useEffect(() => {
    if (!isReady) return;

    const { query } = getQuery();

    const decrypted = decrypt(query.code, query.key);
    const [seed, targetTime] = decrypted.split(SEP);

    setSeed(Number(seed));
    setLang(query.lang);

    axios.head(window.location.href).then((res) => {
      const serverTime = dayjs(res.headers.date);
      const deviceTime = dayjs();

      // 1. デバイス時刻とサーバー時刻の差分を取得、
      // 2. デバイスの時刻のほうがサーバー時刻より早ければ、
      //    その分だけ開示を遅らせる必要がある
      //    -> ターゲット時刻をその分だけ遅くする
      //    -> target += server - device
      setTargetTime(dayjs(targetTime).add(serverTime.diff(deviceTime)));
      return undefined;
    });
  }, [isReady, themeName]);

  useInterval(() => {
    if (targetTime === undefined) return;

    if (targetTime.diff(undefined, 'seconds', true) < 1) {
      updateQuery('/', {
        seed: Number(seed),
        lang: lang ?? 'en',
        theme: themeName,
      });
    }
  }, 250);

  return <CountdownUI target={targetTime} />;
};

export default Countdown;
