import { BoardWarningBanner } from "./BoardWarningBanner";

export const EmptyTaskWarning = () => (
  <BoardWarningBanner
    messageKey="board.emptyTaskWarning.message"
    rerollKey="board.emptyTaskWarning.reroll"
  />
);
