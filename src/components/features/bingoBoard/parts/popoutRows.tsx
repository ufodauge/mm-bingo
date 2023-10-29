import { memo } from "react";
import PopoutButton from "../buttons/popoutButton";
import { container } from "./popouts.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";

type Props = { boardSize: number };

const PopoutRows = memo<Props>(function PopoutRows({ boardSize }) {
  const popoutButtons = [];
  for (let i = 0; i < boardSize; i++) {
    popoutButtons.push(<PopoutButton lineType={`row${i + 1}`} key={i} />);
  }

  return (
    <div
      className={container}
      style={assignInlineVars({
        gridTemplateRows: "1fr ".repeat(boardSize).trim()
      })}
    >
      {popoutButtons}
    </div>
  );
});

export default PopoutRows;
