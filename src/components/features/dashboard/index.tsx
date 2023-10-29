/* eslint-disable react-hooks/exhaustive-deps */
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, { memo, useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/button";
import { SEP } from "@/const/crypto";
import {
  useBingoBoardActionsContext,
  useBingoBoardValuesContext,
} from "@/contexts/bingoBoard";
import { useLanguageValue } from "@/contexts/language";
import { useThemeValue } from "@/contexts/theme";
import { encrypt } from "@/lib/encoder";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { CountdownQuery } from "@/types/query/countdown";
import { MainPageQuery } from "@/types/query/mainpage";

import DistributionForm from "./distributionForm";
import { columnSpanAll, container } from "./index.css";
import LayoutForm from "./layoutForm";
import SeedForm from "./seedForm";

const DEFAULT_SEED_DIGITS = 1000000;
const DEFAULT_MINUTES_OFFSET = 30;

dayjs.extend(utc);
dayjs.extend(timezone);

const DashBoard = memo(function DashBoard() {
  const { seed }                           = useBingoBoardValuesContext();
  const { languageName }                   = useLanguageValue();
  const { themeName }                      = useThemeValue();
  const { isReady, getQuery, updateQuery } = useRouterPush<MainPageQuery>();

  const { setSeed, updateTasks } = useBingoBoardActionsContext();

  const currentTime = dayjs();
  const defaultTime = currentTime.second(
    currentTime.second() + DEFAULT_MINUTES_OFFSET * 60
  );

  const [distributeTime, setDistributeTime] = useState<Dayjs>(defaultTime);

  const updateBoard = (seed: number) => {
    if (!isReady) {
      return;
    }

    updateTasks(seed, languageName);

    const { pathname, query } = getQuery();
    const newQuery = {
      ...query,
      seed: seed,
      lang: languageName,
      theme: themeName,
    };

    updateQuery(pathname, newQuery, true);
  };

  const randomizeClicked = () => {
    const _seed = Math.floor(Math.random() * DEFAULT_SEED_DIGITS);
    setSeed(_seed);
    updateBoard(_seed);
  };

  const updateClicked = () => {
    updateBoard(seed);
  };

  useEffect(() => updateBoard(seed), [languageName]);

  const Countdown = useRouterPush<MainPageQuery, CountdownQuery>();
  const distributeClicked = useCallback(() => {
    const [code, key] = encrypt([seed, distributeTime].join(SEP));

    const newQuery: CountdownQuery = {
      code,
      key,
      lang: languageName,
      theme: themeName,
    };
    Countdown.updateQuery("/countdown", newQuery);
  }, [languageName, seed, distributeTime, themeName]);

  return (
    <div className={container}>
      <SeedForm />
      <LayoutForm />
      <DistributionForm setDistributeTime={setDistributeTime} />

      <Button
        outlined
        customProps={{
          onClick: randomizeClicked,
        }}
      >
        Randomize
      </Button>

      <Button
        outlined
        customProps={{
          onClick: updateClicked,
        }}
      >
        Update
      </Button>

      <Button
        outlined
        customProps={{
          onClick: distributeClicked,
        }}
        customStyle={columnSpanAll}
      >
        Distribute
      </Button>
    </div>
  );
});

export default DashBoard;
