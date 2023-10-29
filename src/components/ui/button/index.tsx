import React, { ButtonHTMLAttributes, ReactNode } from "react";
import * as style from "./index.css";

type Props = {
  customProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  outlined   ?: boolean;
  ghost      ?: boolean;
  children   ?: ReactNode;
  customStyle?: string;
};

const Button: React.FC<Props> = ({
  children,
  customProps,
  outlined,
  ghost,
  customStyle,
}) => {
  const classNames = [
    style.defaultStyle,
    outlined ? style.outlined : "",
    ghost    ? style.ghost    : "",
    customStyle ?? "",
  ].join(" ");

  return (
    <button type="button" className={classNames} {...customProps}>
      {children}
    </button>
  );
};

export default Button;
