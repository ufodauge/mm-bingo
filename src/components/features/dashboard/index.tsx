/* eslint-disable react-hooks/exhaustive-deps */
import assert from "assert";
import React, { ChangeEventHandler, useCallback, useState } from "react";

import Button from "@/components/ui/button";
import DateInput from "@/components/ui/dateinput";
import Label from "@/components/ui/label";
import Selector, { Options } from "@/components/ui/selector";
import TextInput from "@/components/ui/textInput";
import { SEP } from "@/const/crypto";
import { useBingoBoardContext } from "@/contexts/bingoBoard";
import { useThemeValue } from "@/contexts/theme";
import { encrypt } from "@/lib/encoder";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { isLayoutName } from "@/types/layout";
import { CountdownQuery } from "@/types/query/countdown";
import { MainPageQuery } from "@/types/query/mainpage";
import { css } from "@emotion/react";

const DEFAULT_SEED_DIGITS = 1000000;
const DEFAULT_MINUTES_OFFSET = 10;

const DashBoard = React.memo(function DashBoard() {
  const { BoardValues, BoardActions } = useBingoBoardContext();
  const { seed, lang } = BoardValues;
  const { setLanguage, setSeed, updateTasks, setLayout } = BoardActions;

  const taskData = useTaskData();

  const defaultTime = new Date();
  defaultTime.setSeconds(
    defaultTime.getSeconds() + DEFAULT_MINUTES_OFFSET * 60
  );

  const [releaseTime, setReleaseTime] = useState(defaultTime.getTime());

  const languageOptions: Options = taskData.lang.map((v) => {
    return { text: v, value: v };
  });

  const { themeName } = useThemeValue();

  const MainPage = useRouterPush<MainPageQuery>();
  const randomizeClicked = useCallback(() => {
    const _seed = Math.floor(Math.random() * DEFAULT_SEED_DIGITS);

    setSeed(_seed);
    updateTasks(_seed, lang);

    const { pathname, query } = MainPage.getQuery();
    const newQuery = {
      ...query,
      seed: _seed,
      lang,
      theme: themeName,
    };

    MainPage.updateQuery(pathname, newQuery, true);
  }, [lang]);

  const updateClicked = useCallback(() => {
    updateTasks(seed, lang);
    const { pathname } = MainPage.getQuery();
    MainPage.updateQuery(
      pathname,
      {
        seed: seed,
        lang,
        theme: themeName,
      },
      true
    );
  }, [lang, seed]);

  const Countdown = useRouterPush<MainPageQuery, CountdownQuery>();
  const releaseClicked = useCallback(() => {
    const [code, key] = encrypt([seed, releaseTime].join(SEP));

    const newQuery: CountdownQuery = {
      code,
      key,
      lang,
      theme: themeName,
    };
    Countdown.updateQuery("/countdown", newQuery);
  }, [lang, seed, releaseTime]);

  const onReleaseTimeChanged: ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (v) =>
        setReleaseTime(
          v.target.valueAsNumber + new Date().getTimezoneOffset() * 60000
        ),
      []
    );

  const onSetSeed: ChangeEventHandler<HTMLInputElement> = useCallback((v) => {
    setSeed(Number(v.target.value));
  }, []);

  const onSetLanguage: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (v) => {
      setLanguage(v.target.value);
      updateTasks(seed, v.target.value);
    },
    [seed]
  );

  const layoutOptions: Options = [
    { text: "vertical", value: "vertical" },
    { text: "horizontal", value: "horizontal" },
  ];

  const onSetLayout: ChangeEventHandler<HTMLSelectElement> = useCallback((v) => {
    assert(isLayoutName(v.target.value));
    setLayout(v.target.value);
  }, []);

  const style = {
    base: css({
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(6, 3em)",
      gap: "0.75em",
      width: "100%",
      transitionDuration: ".2s",
      transitionTimingFunction: "ease-in-out",
    }),
    colSpan2: css({
      gridColumn: "span 2 / span 2",
    }),
  };

  return (
    <div css={style.base}>
      <Button outlined onClick={randomizeClicked}>
        Randomize
      </Button>
      <Button outlined onClick={updateClicked}>
        Update
      </Button>

      <Label>Seed</Label>
      <TextInput type="number" value={seed} onChange={onSetSeed} />

      <Label>Language</Label>
      <Selector
        options={languageOptions}
        onChange={onSetLanguage}
        value={lang}
      />

      <Label>Layout</Label>
      <Selector options={layoutOptions} onChange={onSetLayout} />

      <Label>Releasing</Label>
      <DateInput defaultTime={defaultTime} onChange={onReleaseTimeChanged} />

      <Button outlined customStyle={style.colSpan2} onClick={releaseClicked}>
        Release
      </Button>
    </div>
  );
});

export default DashBoard;
