import TaskButton from "../buttons/taskButton";
import { useBingoBoardValuesContext } from "@/contexts/bingoBoard";
import { container } from "./popouts.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";

type Props = { boardSize: number; };

const TaskBoard: React.FC<Props> = ({ boardSize }) => {
  const { tasks } = useBingoBoardValuesContext();

  const taskButtons = [];
  for (let i = 0; i < boardSize ** 2; i++) {
    taskButtons.push(
      <TaskButton
        text       = {tasks.at(i)?.text ?? "NO TEXT"}
        lineTypes  = {tasks.at(i)?.lineTypes  ?? []}
        slotNumber = {i}
        key        = {i}
      />
    );
  }

  return (
    <div
      className={container}
      style={assignInlineVars({
        gridTemplateColumns: "1fr ".repeat(boardSize).trim(),
        gridTemplateRows   : "1fr ".repeat(boardSize).trim()
      })}
    >
      {taskButtons}
    </div>
  );
};

export default TaskBoard;
