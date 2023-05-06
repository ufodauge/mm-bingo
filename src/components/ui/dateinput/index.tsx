import { css, useTheme } from "@emotion/react";
import { ChangeEventHandler } from "react";

type Props = {
  defaultTime: Date;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const adjustToLocalTime = (date: Date): void => {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
};
const dateToFormattedString = (date: Date): string =>
  date.toISOString().slice(0, -8);

const DateInput: React.FC<Props> = ({ defaultTime, onChange }) => {
  // clone to prevent breaking change
  const date = new Date(defaultTime);

  adjustToLocalTime(date);
  const defaultValue = dateToFormattedString(date);

  const theme = useTheme();

  const style = css({
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
      type="datetime-local"
      defaultValue={defaultValue}
      onChange={onChange}
      css={style}
    />
  );
};

export default DateInput;
