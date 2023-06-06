/* eslint-disable react-hooks/exhaustive-deps */
import assert from "assert";
import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";

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
import { isLayoutName } from "@/types/layout";
import { CountdownQuery } from "@/types/query/countdown";
import { MainPageQuery } from "@/types/query/mainpage";
import { css } from "@emotion/react";
import { useLanguageValue } from "@/contexts/language";

const DEFAULT_SEED_DIGITS = 1000000;
const DEFAULT_MINUTES_OFFSET = 10;

const DashBoard = React.memo(function DashBoard() {
  const { BoardValues, BoardActions } = useBingoBoardContext();
  const { seed } = BoardValues;
  const { setSeed, updateTasks, setLayout } = BoardActions;
  const { languageName } = useLanguageValue();

  const defaultTime = new Date();
  defaultTime.setSeconds(
    defaultTime.getSeconds() + DEFAULT_MINUTES_OFFSET * 60
  );

  const [releaseTime, setReleaseTime] = useState(defaultTime.getTime());

  const { themeName } = useThemeValue();

  const MainPage = useRouterPush<MainPageQuery>();
  const randomizeClicked = useCallback(() => {
    if (!MainPage.isReady) {
      return;
    }
    const _seed = Math.floor(Math.random() * DEFAULT_SEED_DIGITS);

    setSeed(_seed);

    const { pathname, query } = MainPage.getQuery();
    const newQuery = {
      ...query,
      seed: _seed,
      lang: languageName,
      theme: themeName,
    };

    MainPage.updateQuery(pathname, newQuery, true);
  }, [languageName]);

  const Countdown = useRouterPush<MainPageQuery, CountdownQuery>();
  const releaseClicked = useCallback(() => {
    const [code, key] = encrypt([seed, releaseTime].join(SEP));

    const newQuery: CountdownQuery = {
      code,
      key,
      lang: languageName,
      theme: themeName,
    };
    Countdown.updateQuery("/countdown", newQuery);
  }, [languageName, seed, releaseTime]);

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

  useEffect(() => {
    if (!MainPage.isReady) return;
    updateTasks(seed, languageName);

    const { pathname } = MainPage.getQuery();
    MainPage.updateQuery(
      pathname,
      {
        seed: seed,
        lang: languageName,
        theme: themeName,
      },
      true
    );
  }, [seed, languageName]);

  const layoutOptions: Options = [
    { text: "vertical", value: "vertical" },
    { text: "horizontal", value: "horizontal" },
  ];

  const onSetLayout: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (v) => {
      assert(isLayoutName(v.target.value));
      setLayout(v.target.value);
    },
    []
  );

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
      <Label>Seed</Label>
      <TextInput type="number" value={seed} onChange={onSetSeed} />

      <Label>Layout</Label>
      <Selector options={layoutOptions} onChange={onSetLayout} />

      <Label>Releasing</Label>
      <DateInput defaultTime={defaultTime} onChange={onReleaseTimeChanged} />

      <Button outlined onClick={randomizeClicked}>
        Randomize
      </Button>

      <Button outlined onClick={releaseClicked}>
        Release
      </Button>
    </div>
  );
});

export default DashBoard;
