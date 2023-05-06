import { Task } from "@/types/task";

import TaskButton from "./taskButton";
import { css } from "@emotion/react";
import { LayoutName } from "@/types/layout";

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
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gap: "3px",
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
