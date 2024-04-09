/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  ReactNode,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useRouterPush } from '@/lib/hooks/useRouterPush';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { generateEmptyTasks, generateTasks } from '@/lib/taskGenerator/v0.1';
import { LayoutName } from '@/types/layout';
import { LineType } from '@/types/lineType';
import { MainPageQuery } from '@/types/query/mainpage';
import { Task } from '@/types/task';

import { useLanguageValue } from '../language';
import { useThemeValue } from '../theme';
import { BoardValuesContext } from './bingoBoardValue';
import { BoardActionsContext } from './bingoBoardAction';

type Props = {
  children: ReactNode;
};

const DEFAULT_SEED_DIGITS = 1000000;

const BingoBoardProvider = memo<Props>(function BingoBoardProvider({
  children,
}) {
  const taskData = useTaskData();
  const { languageName } = useLanguageValue();

  const [seed, setSeed] = useState(0);
  const [layout, setLayout] = useState<LayoutName>('vertical');
  {
    /* 
    // TODO 
  */
  }
  const [tasks, setTasks] = useState<Task[]>(
    generateEmptyTasks(taskData as never)
  );
  const [targetedLine, setTargetedLine] = useState<LineType | undefined>();

  const updateTasks = useCallback((_seed: number, lang: string) => {
    if (seed === _seed) return;
    {
      /* 
      // TODO 
    */
    }
    const [tasks] = generateTasks(taskData as never, _seed, lang);
    setTasks(tasks);
  }, []);

  const updateTargetedLine = useCallback((lineType?: LineType) => {
    setTargetedLine(lineType);
  }, []);

  const { isReady, getQuery, updateQuery } = useRouterPush<MainPageQuery>();
  const { themeName } = useThemeValue();

  useEffect(() => {
    if (!isReady) return;

    const { query, pathname } = getQuery();

    const _seed = !Number.isNaN(Number(query.seed))
      ? Number(query.seed)
      : Math.floor(Math.random() * DEFAULT_SEED_DIGITS);

    setSeed(_seed);

    updateTasks(_seed, languageName);

    const newQuery = {
      ...query,
      seed: _seed,
      theme: themeName,
    };

    updateQuery(pathname, newQuery, true);
  }, [isReady, languageName]);

  const boardValues = {
    seed,
    tasks,
    targetedLine,
    layout,
  };

  const boardActions = {
    setSeed,
    updateTasks,
    updateTargetedLine,
    setLayout,
  };

  return (
    <BoardValuesContext.Provider value={boardValues}>
      <BoardActionsContext.Provider value={boardActions}>
        {children}
      </BoardActionsContext.Provider>
    </BoardValuesContext.Provider>
  );
});

export const useBingoBoardValuesContext = () => useContext(BoardValuesContext);
export const useBingoBoardActionsContext = () =>
  useContext(BoardActionsContext);

export default BingoBoardProvider;
