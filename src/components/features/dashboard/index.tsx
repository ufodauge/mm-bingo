import assert from 'assert';
import { ChangeEventHandler, useState } from 'react';

import Button from '@/components/ui/button';
import DateInput from '@/components/ui/dateinput';
import Label from '@/components/ui/label';
import Selector, { Options } from '@/components/ui/selector';
import TextInput from '@/components/ui/textInput';
import { useBingoBoardContext } from '@/contexts/bingoBoard';
import { useThemeValue } from '@/contexts/theme';
import { Encode } from '@/lib/encoder';
import { useRouterPush } from '@/lib/hooks/useRouterPush';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { isLayoutName } from '@/types/layout';
import { CountdownQuery } from '@/types/query/countdown';
import { css } from '@emotion/react';

const DEFAULT_SEED_DIGITS = 1000000;
const DEFAULT_MINUTES_OFFSET = 10;

type Props = {};

const DashBoard: React.FC<Props> = () => {
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

  const [getMainPageQuery, updateMainPageQueryQuery] = useRouterPush();
  const randomizeClicked = () => {
    const s = Math.floor(Math.random() * DEFAULT_SEED_DIGITS);

    setSeed(s);
    updateTasks(s, lang);

    const [pathname, query] = getMainPageQuery();
    const newQuery = {
      ...query,
      seed: s,
      lang,
      theme: themeName,
    };

    updateMainPageQueryQuery(pathname, newQuery, true);
  };
  const updateClicked = () => {
    updateTasks(seed, lang);

    updateMainPageQueryQuery(
      "/",
      {
        seed: seed,
        lang,
        theme: themeName,
      },
      true
    );
  };

  const { themeName } = useThemeValue();

  const [getCountDownQuery, updateCountDownQuery] =
    useRouterPush<CountdownQuery>();
  const releaseClicked = () => {
    const [_, query] = getCountDownQuery()

    assert(typeof query.gist === "string" || typeof query.gist === "undefined");

    const newQuery: CountdownQuery = {
      seed: Encode(`${seed}`),
      release: Encode(`${releaseTime}`),
      lang,
      theme: themeName,
      gist: query.gist
    };
    updateCountDownQuery("/countdown", newQuery);
  };
  const onReleaseTimeChanged: ChangeEventHandler<HTMLInputElement> = (v) =>
    setReleaseTime(
      v.target.valueAsNumber + new Date().getTimezoneOffset() * 60000
    );
  const onSetSeed: ChangeEventHandler<HTMLInputElement> = (v) => {
    setSeed(Number(v.target.value));
  };
  const onSetLanguage: ChangeEventHandler<HTMLSelectElement> = (v) => {
    setLanguage(v.target.value);
    updateTasks(seed, v.target.value);
  };

  const layoutOptions: Options = [
    { text: "vertical", value: "vertical" },
    { text: "horizontal", value: "horizontal" },
  ];

  const onSetLayout: ChangeEventHandler<HTMLSelectElement> = (v) => {
    assert(isLayoutName(v.target.value));
    setLayout(v.target.value);
  };

  const style = {
    base: css({
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(6, 3rem)",
      gap: "0.75rem",
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
};

export default DashBoard;
