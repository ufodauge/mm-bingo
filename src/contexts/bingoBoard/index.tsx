/* eslint-disable react-hooks/exhaustive-deps */
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import TaskGenerator from "@/class/TaskGenerator";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { LayoutName } from "@/types/layout";
import { LineType } from "@/types/lineType";
import { MainPageQuery } from "@/types/query/mainpage";
import { Task } from "@/types/task";

import { useThemeValue } from "../theme";

type BoardValuesProps = {
  seed: number;
  lang: string;
  tasks: Task[];
  targetedLine?: LineType;
  layout: LayoutName;
};

type BoardActionsProps = {
  setSeed: React.Dispatch<React.SetStateAction<number>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  setLayout: React.Dispatch<React.SetStateAction<LayoutName>>;
  updateTargetedLine: (lineType?: LineType) => void;
  updateTasks: (seed: number, lang: string) => void;
};

const BoardValuesContext = createContext<BoardValuesProps>({
  seed: 0,
  lang: "en",
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
  setLanguage: () => {
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

const BingoBoardProvider: FC<Props> = ({ children }: Props) => {
  const taskData = useTaskData();

  const [seed, setSeed] = useState(0);
  const [lang, setLanguage] = useState(taskData.lang[0]);
  const [tasks, setTasks] = useState(
    TaskGenerator(taskData, 0, taskData.lang[0])
  );
  const [layout, setLayout] = useState<LayoutName>("vertical");

  const updateTasks = useCallback((seed: number, lang: string) => {
    setTasks(TaskGenerator(taskData, seed, lang));
  }, []);

  const [targetedLine, setTargetedLine] = useState<LineType | undefined>();
  const updateTargetedLine = useCallback((lineType?: LineType) => {
    setTargetedLine(lineType);
  }, []);

  const { isReady, getQuery, updateQuery } = useRouterPush<MainPageQuery>();
  const { themeName } = useThemeValue();

  useEffect(() => {
    const { query, pathname } = getQuery();

    const _lang =
      query.lang && taskData.lang.includes(query.lang)
        ? query.lang
        : taskData.lang[0];
    const _seed = !Number.isNaN(Number(query.seed))
      ? Number(query.seed)
      : Math.floor(Math.random() * DEFAULT_SEED_DIGITS);

    setSeed(_seed);
    setLanguage(_lang);

    updateTasks(_seed, _lang);

    const newQuery = {
      ...query,
      seed: _seed,
      lang: _lang,
      theme: themeName,
    };

    updateQuery(pathname, newQuery, true);
  }, [isReady]);

  const boardValues = {
    seed,
    lang,
    tasks,
    targetedLine,
    layout,
  };

  const boardActions = {
    setSeed,
    updateTasks,
    setLanguage,
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
};

export const useBingoBoardContext = () => {
  return {
    BoardValues: useContext(BoardValuesContext),
    BoardActions: useContext(BoardActionsContext),
  };
};

export default BingoBoardProvider;
