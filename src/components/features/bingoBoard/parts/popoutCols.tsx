import { memo } from "react";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import PopoutButton from "../buttons/popoutButton";
import { container, popoutCols } from "./popouts.css";

type Props = { boardSize: number };

const PopoutCols = memo<Props>(function PopoutCols({ boardSize }) {
  const popoutButtons = [];
  for (let i = 0; i < boardSize; i++) {
    popoutButtons.push(<PopoutButton lineType={`col${i + 1}`} key={i} />);
  }

  return (
    <div
      className={`${container} ${popoutCols}`}
      style={assignInlineVars({
        gridTemplateColumns: "1fr ".repeat(boardSize).trim(),
      })}
    >
      {popoutButtons}
    </div>
  );
});

export default PopoutCols;
