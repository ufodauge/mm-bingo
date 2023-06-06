import { useState } from 'react';

import Header from '@/components/features/popoutWindow/header';
import TaskButtons from '@/components/features/popoutWindow/taskButtons';
import { useThemeAction } from '@/contexts/theme';
import { useQuery } from '@/lib/hooks/useQuery';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { isLayoutName, LayoutName } from '@/types/layout';
import { PopoutQuery } from '@/types/query/popout';
import { Task } from '@/types/task';
import { isThemeName } from '@/types/theme/theme';
import { css } from '@emotion/react';

type Props = {};

const Home: React.FC<Props> = () => {
  const [header, setHeader] = useState<string>("");

  const [layoutName, setLayoutName] = useState<LayoutName>("vertical");
  const [tasks, setTasks] = useState<Task[]>([]);

  const taskData = useTaskData();
  const { setTheme } = useThemeAction();

  useQuery<PopoutQuery>(
    (query) => {
      setHeader(query.header);
      setTasks(
        query.tasks?.split(";").map((v) => {
          const result = taskData.data[Number(v)];

          return {
            index: Number(v),
            difficulty: result ? result.difficulty : 0,
            text: result ? result.contents[query.lang] : "Error!",
            filter: BigInt(0),
            lineTypes: [],
            trackers: result ? result.trackers ?? [] : [],
          };
        }) ?? []
      );

      if (isLayoutName(query.layout)) {
        setLayoutName(query.layout);
      }

      if (isThemeName(query.theme)) {
        setTheme(query.theme);
      }
    },
    {
      tasks: "0;0;0;0;0",
      lang: "en",
      layout: "vertical",
      header: "col1",
      theme: "light",
    }
  );

  const headerSize = "2em";
  const style = css({
    display: "grid",
    gridTemplateRows: header === "" ? "1fr" : `${headerSize} 1fr`,
    minHeight: "100vh",
  });

  return (
    <div css={style}>
      <Header text={header} />
      <TaskButtons tasks={tasks} layout={layoutName} />
    </div>
  );
};

export default Home;
