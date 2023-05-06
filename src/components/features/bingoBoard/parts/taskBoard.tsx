import { css } from "@emotion/react";
import TaskButton from "../buttons/taskButton";
import { useBingoBoardContext } from "@/contexts/bingoBoard";

type Props = { boardSize: number; gap: number };

const TaskBoard: React.FC<Props> = ({ boardSize, gap }) => {
  const { tasks } = useBingoBoardContext().BoardValues;

  const style = css({
    display: "grid",
    gridTemplateColumns: [...Array(boardSize)].map(() => "1fr").join(" "),
    gridTemplateRows: [...Array(boardSize)].map(() => "1fr").join(" "),
    gap: `${gap}px`,
  });
  return (
    <div css={style}>
      {[...Array(boardSize ** 2)].map((_, i) => (
        <TaskButton
          text={tasks[i].text}
          lineTypes={tasks[i].lineTypes}
          key={i}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
