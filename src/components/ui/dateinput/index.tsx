import { ChangeEventHandler, memo } from "react";
import { base } from "./index.css";
import { Dayjs } from "dayjs";

type Props = {
  defaultTime: Dayjs;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const DateInput = memo<Props>(function DateInput({ defaultTime, onChange }) {
  const date = defaultTime;

  return (
    <input
      type         = "datetime-local"
      defaultValue = {date.format("YYYY-MM-DDTHH:mm")}
      onChange     = {onChange}
      className    = {base}
    />
  );
});

export default DateInput;
