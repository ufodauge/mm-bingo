import { ButtonHTMLAttributes, useState } from "react";

import Button from "@/components/ui/button";
import * as style from "./counter.css";

type Props = {
  max  : number;
  init : number;
  icon?: string;
};

const Counter: React.FC<Props> = ({ max, init, icon }) => {
  const [count, setCount] = useState(init);

  const countUp   = () => setCount(count >= max ? count : count + 1);
  const countDown = () => setCount(count <= 0 ? count : count - 1);

  const customProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    onClick: (e) => {
      e.stopPropagation();
      countUp();
    },
    onContextMenu: (e) => {
      e.preventDefault();
      e.stopPropagation();
      countDown();
    },
  };

  return (
    <Button ghost customProps={customProps} customStyle={style.container}>
      {icon ? <img src={icon} alt="" css={style.image} /> : <></>}
      <div css={style.text}>
        <p css={style.textMain}>{count}</p>
        <p css={[style.textSub, style.textSlash]}>/</p>
        <p css={style.textSub}>{max}</p>
      </div>
    </Button>
  );
};

export default Counter;
