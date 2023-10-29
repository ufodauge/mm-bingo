import { MouseEventHandler, useState } from "react";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as style from "./toggler.css";

type Props = {
  icons: string[];
};

const Toggler: React.FC<Props> = ({ icons }) => {
  const [togglers, setTogglers] = useState<boolean[]>(icons.map(() => false));
  const toggleByIndex = (i: number) => {
    setTogglers(togglers.map((v, j) => (i === j ? !v : v)));
  };

  const buttons: JSX.Element[] = icons.map((icon, i) => {
    const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
      e.stopPropagation();
      toggleByIndex(i);
    };

    return (
      <div
        key     = {i}
        css     = {style.base}
        onClick = {onClick}
        style   = {assignInlineVars({
          opacity: togglers.at(i) ? "" : "30%",
          filter : togglers.at(i) ? "" : "grayscale(1)",
        })}
      >
        <img
          src = {icon === "" ? "/button.png" : icon}
          alt = "icon"
          css = {style.image}
        />
      </div>
    );
  });

  return <div css={style.container}>{buttons}</div>;
};

export default Toggler;
