import { LayoutName } from '@/types/layout';
import { Task } from '@/types/task';
import { css } from '@emotion/react';

import TaskButton from './taskButton';

type Props = {
  tasks: Task[];
  layout: LayoutName;
};

const TaskButtons: React.FC<Props> = ({ tasks, layout }) => {
  const [cols, rows] = (() => {
    switch (layout) {
      case "card":
        const size = Math.floor(Math.sqrt(tasks.length));
        return [size, size];
      case "horizontal":
        return [tasks.length, 1];
      default:
        return [1, tasks.length];
    }
  })();

  const style = css({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, minmax(12em, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(4em, 1fr))`,
    gap: ".1em",
  });

  return (
    <div css={style}>
      {tasks.map((v, i) => (
        <TaskButton key={i} task={v} />
      ))}
    </div>
  );
};

export default TaskButtons;
