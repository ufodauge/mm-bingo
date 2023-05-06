import { createContext, FC, ReactNode, useContext, useState } from "react";

import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import TaskGenerator from "@/class/TaskGenerator";
import { DefaultLanguage } from "@/const/language";
import { useQuery } from "@/lib/hooks/useQuery";
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

const BingoBoardWrapper: FC<Props> = ({ children }: Props) => {
  const taskData = useTaskData();

  const [seed, setSeed] = useState(0);
  const [lang, setLanguage] = useState("en");
  const [tasks, setTasks] = useState(TaskGenerator(taskData, 0, "en"));
  const [layout, setLayout] = useState<LayoutName>("vertical");

  const updateTasks = (seed: number, lang: string) =>
    setTasks(TaskGenerator(taskData, seed, lang));

  const [targetedLine, setTargetedLine] = useState<LineType | undefined>();
  const updateTargetedLine = (lineType?: LineType) => {
    setTargetedLine(lineType);
  };

  const [getQuery, updateQuery] = useRouterPush<MainPageQuery>();
  const { themeName } = useThemeValue();

  useQuery(
    (v) => {
      const _lang =
        v.lang && taskData.lang.includes(v.lang) ? v.lang : DefaultLanguage;
      const _seed = !Number.isNaN(Number(v.seed))
        ? Number(v.seed)
        : Math.floor(Math.random() * DEFAULT_SEED_DIGITS);

      setSeed(_seed);
      setLanguage(_lang);

      updateTasks(_seed, _lang);

      const [pathname, query] = getQuery();

      const newQuery = {
        ...query,
        seed: _seed,
        lang: _lang,
        theme: themeName,
      };

      updateQuery(pathname, newQuery, true);
    },
    {
      seed: "",
      lang: "en",
    }
  );

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

export default BingoBoardWrapper;
