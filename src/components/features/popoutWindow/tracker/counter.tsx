import Button from "@/components/ui/button";
import { hslToHex } from "@/lib/utils/colorConversion";
import { css, useTheme } from "@emotion/react";
import { ButtonHTMLAttributes, useState } from "react";

type Props = {
  max: number;
  init: number;
  icon?: string;
};

const Counter: React.FC<Props> = ({ max, init, icon }) => {
  const [count, setCount] = useState(init);

  const countUp = () => setCount(count >= max ? count : count + 1);
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

  const theme = useTheme();

  const customStyle = css({
    padding: ".3em",
    paddingInline: ".8em",
    "&:hover": {
      backgroundColor: theme.baseVariant,
      color: theme.baseContent,
    },
  });

  const style = {
    text: css({
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      height: "2em",
    }),
    textSub: css({
      color: theme.neutral,
    }),
    textMain: css({
      padding: "",
      fontSize: "1.2em"
    }),
    textSlash: css({
      paddingInlineStart: "0.5em",
    }),
  };

  return (
    <Button ghost customProps={customProps} customStyle={customStyle}>
      {icon ? <img src={icon} alt="" /> : <></>}
      <div css={style.text}>
        <p css={style.textMain}>{count}</p>
        <p css={[style.textSub, style.textSlash]}>/</p>
        <p css={style.textSub}>{max}</p>
      </div>
    </Button>
  );
};

export default Counter;
