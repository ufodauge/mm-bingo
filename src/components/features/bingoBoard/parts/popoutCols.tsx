import { css } from "@emotion/react";
import PopoutButton from "../buttons/popoutButton";

type Props = { boardSize: number, gap: number };

const PopoutCols: React.FC<Props> = ({ boardSize, gap }) => {
  const style = css({
    display: "grid",
    gridTemplateColumns: [...Array(boardSize)].map(() => "1fr").join(" "),
    gap: `${gap}px`,
  });
  return (
    <div css={style}>
      {[...Array(boardSize)].map((_, i) => (
        <PopoutButton lineType={`col${i + 1}`} key={i}/>
      ))}
    </div>
  );
};

export default PopoutCols;
