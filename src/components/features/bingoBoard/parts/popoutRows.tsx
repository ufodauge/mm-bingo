import { css } from "@emotion/react";
import PopoutButton from "../buttons/popoutButton";

type Props = { boardSize: number, gap: number };

const PopoutRows: React.FC<Props> = ({ boardSize, gap }) => {
  const style = css({
    display: "grid",
    gridTemplateRows: [...Array(boardSize)].map(() => "1fr").join(" "),
    gap: `${gap}px`,
  });
  return (
    <div css={style}>
      {[...Array(boardSize)].map((_, i) => (
        <PopoutButton lineType={`row${i + 1}`} key={i}/>
      ))}
    </div>
  );
};

export default PopoutRows;
