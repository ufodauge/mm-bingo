import React, { ChangeEventHandler, HTMLInputTypeAttribute, memo } from "react";

import { container } from "./index.css";

type Props = {
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const TextInput = memo<Props>(function TextInput({
  placeholder,
  value,
  onChange,
  type,
}) {
  return (
    <input
      type        = {type}
      className   = {container}
      placeholder = {placeholder}
      value       = {value}
      onChange    = {onChange}
    />
  );
});

export default TextInput;
