import { useState } from 'react';

import Header from '@/components/features/popoutWindow/header';
import TaskButtons from '@/components/features/popoutWindow/taskButtons';
import { useBingoBoardValuesContext } from '@/contexts/bingoBoard';
import { useThemeAction } from '@/contexts/theme';
import { useQuery } from '@/lib/hooks/useQuery';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { isLayoutName, LayoutName } from '@/types/layout';
import { LineType } from '@/types/lineType';
import { PopoutQuery } from '@/types/query/popout';
import { Task } from '@/types/task';
import { isThemeName } from '@/types/theme/theme';

import { container } from './index.css';
import PopoutButtons from './popoutButtons';

type Props = {};

const Home: React.FC<Props> = () => {
  const [header, setHeader] = useState<LineType | undefined>();
  const [layoutName, setLayoutName] = useState<LayoutName>("vertical");

  const { setTheme } = useThemeAction();
  const { tasks } = useBingoBoardValuesContext();

  const taskData = useTaskData();
  const edgeLength = taskData.size;

  const deriveTasks = (tasks: Task[], lineType: LineType): Task[] => {
    switch (lineType) {
      case "tlbr":
        return tasks.filter((_, i) => i % (edgeLength + 1) === 0);
      case "bltr":
        return tasks.filter(
          (_, i) =>
            i % (edgeLength - 1) === 0 &&
            !(i === 0 || i === edgeLength ** 2 - 1)
        );
      case "tlbr":
        return tasks.filter((_, i) => i % (edgeLength + 1) === 0);
    }

    const matched = /^(col|row)(\d+)$/.exec(lineType);
    const direction = matched?.at(1);
    const indexStr = matched?.at(2);

    if (matched === null || direction === undefined || indexStr === undefined) {
      throw new Error("ParseLineTypeError");
    } else if (
      !["row", "col"].includes(direction) ||
      Number.isNaN(Number(indexStr))
    ) {
      throw new Error("ParseLineTypeError");
    }

    const index = Number(indexStr);

    if (direction === "row") {
      return tasks.slice((index - 1) * edgeLength, index * edgeLength);
    } else if (direction === "col") {
      return tasks.filter((_, i) => i % edgeLength === index - 1);
    }

    throw new Error("Unreachable")
  };

  useQuery<PopoutQuery>(
    (query) => {
      setHeader(query.header);

      if (isLayoutName(query.layout)) {
        setLayoutName(query.layout);
      }

      if (isThemeName(query.theme)) {
        setTheme(query.theme);
      }
    },
    {
      seed: "0",
      lang: "en",
      layout: "vertical",
      header: "row1",
      theme: "light",
    }
  );

  const innerElements = header ? (
    <div className={container}>
      <Header text={header} />
      {layoutName === "card" ? (
        <PopoutButtons>
          <TaskButtons tasks={tasks} layout={layoutName} />
        </PopoutButtons>
      ) : (
        <TaskButtons tasks={deriveTasks(tasks, header)} layout={layoutName} />
      )}
    </div>
  ) : (
    <></>
  );

  return innerElements;
};

export default Home;
