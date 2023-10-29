import { LayoutName } from "@/types/layout";
import { Task } from "@/types/task";

import TaskButton from "./taskButton";
import { container } from "./taskButtons.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import {
  CARD_CELL_PX,
  VERT_CELL_HEIGHT,
  VERT_CELL_WIDTH,
  HORZ_CELL_HEIGHT,
  HORZ_CELL_WIDTH,
} from "@/const/popupWindowFeatures";

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
      case "vertical":
        return [1, tasks.length];
      default:
        throw new Error("Unreachable");
    }
  })();

  const disableTrackers = layout === "card";

  const [width, height] = getCellPxSizes(layout);

  return (
    <div
      className={container}
      style={assignInlineVars({
        gridTemplateColumns: `repeat(${cols}, minmax(${width}px, 1fr))`,
        gridTemplateRows   : `repeat(${rows}, minmax(${height}px, 1fr))`,
      })}
    >
      {tasks.map((v, i) => (
        <TaskButton key={i} task={v} disableTrackers={disableTrackers} />
      ))}
    </div>
  );
};

const getCellPxSizes = (layout: LayoutName): [number, number] => {
  if (layout === "card") {
    return [CARD_CELL_PX, CARD_CELL_PX];
  } else if (layout === "horizontal") {
    return [HORZ_CELL_WIDTH, HORZ_CELL_HEIGHT];
  } else if (layout === "vertical") {
    return [VERT_CELL_WIDTH, VERT_CELL_HEIGHT];
  }
  throw new Error("Unreachable");
}

export default TaskButtons;
