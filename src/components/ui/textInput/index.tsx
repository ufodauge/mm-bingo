import React, { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

import { css, useTheme } from "@emotion/react";

type Props = {
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const TextInput: React.FC<Props> = ({ placeholder, value, onChange, type }) => {
  const theme = useTheme();
  const style = css({
    width: "-webkit-fill-available",
    backgroundColor: theme.baseVariant,
    color: theme.baseContent,
    borderColor: theme.baseVariant,
    borderStyle: "solid",
    borderWidth: "2px",
    borderRadius: "10px",
    padding: "1rem",
    transition: "inherit",
  });

  return (
    <input
      type={type}
      css={style}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default TextInput;
