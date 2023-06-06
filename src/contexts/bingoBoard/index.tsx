/* eslint-disable react-hooks/exhaustive-deps */
import React, {
    createContext, ReactNode, useCallback, useContext, useEffect, useState
} from 'react';

import {
    UnimplementedFunctionCalledException
} from '@/class/exception/unimplementedFunctionCalled';
import { useRouterPush } from '@/lib/hooks/useRouterPush';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { generateTasks } from '@/lib/taskGenerator/v0.1';
import { LayoutName } from '@/types/layout';
import { LineType } from '@/types/lineType';
import { MainPageQuery } from '@/types/query/mainpage';
import { Task } from '@/types/task';

import { useLanguageValue } from '../language';
import { useThemeValue } from '../theme';

type BoardValuesProps = {
  seed: number;
  tasks: Task[];
  targetedLine?: LineType;
  layout: LayoutName;
};

type BoardActionsProps = {
  setSeed: React.Dispatch<React.SetStateAction<number>>;
  setLayout: React.Dispatch<React.SetStateAction<LayoutName>>;
  updateTargetedLine: (lineType?: LineType) => void;
  updateTasks: (seed: number, lang: string) => void;
};

const BoardValuesContext = createContext<BoardValuesProps>({
  seed: 0,
  tasks: [],
  layout: "vertical",
});

const BoardActionsContext = createContext<BoardActionsProps>({
  setSeed: () => {
    throw new UnimplementedFunctionCalledException();
  },
  updateTargetedLine: () => {
    throw new UnimplementedFunctionCalledException();
  },
  setLayout: () => {
    throw new UnimplementedFunctionCalledException();
  },
  updateTasks: () => {
    throw new UnimplementedFunctionCalledException();
  },
});

type Props = {
  children: ReactNode;
};

const DEFAULT_SEED_DIGITS = 1000000;

const BingoBoardProvider = React.memo<Props>(function BingoBoardProvider({
  children,
}) {
  const taskData = useTaskData();
  const { languageName } = useLanguageValue();

  const [seed, setSeed] = useState(0);
  const [tasks, setTasks] = useState<Task[]>(
    generateTasks(taskData, seed, languageName)
  );
  const [layout, setLayout] = useState<LayoutName>("vertical");

  const updateTasks = useCallback((seed: number, lang: string) => {
    const tasks = generateTasks(taskData, seed, lang);
    setTasks(tasks);
  }, []);

  const [targetedLine, setTargetedLine] = useState<LineType | undefined>();
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
  }, [isReady]);

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

export const useBingoBoardContext = () => {
  return {
    BoardValues: useContext(BoardValuesContext),
    BoardActions: useContext(BoardActionsContext),
  };
};

export default BingoBoardProvider;
