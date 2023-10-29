// const options = [
//   { text: ..., value: ... },
//   { text: ..., value: ... },
//   ...,
//   { group: ..., values: [
//      { text: ..., value: ... },
//      { text: ..., value: ... },
//      ...,
//   ] },
// ]

import { ChangeEventHandler, memo } from "react";
import { container } from "./index.css";

type Option = { text: string; value: any };
type Group = { group: string; values: Option[] };
export type Options = (Option | Group)[];

const isOption = (v: any): v is Option =>
  Object.keys(v).includes("text") &&
  Object.keys(v).includes("value") &&
  Object.keys(v).length === 2;

type Props = {
  options         : Options;
  customClassName?: string;
  onChange       ?: ChangeEventHandler<HTMLSelectElement>;
  value          ?: string;
};

const Selector = memo<Props>(function Selector({
  options,
  onChange,
  value,
  customClassName,
}) {
  return (
    <select
      className    = {`${container} ${customClassName}`}
      onChange     = {onChange}
      defaultValue = {value}
    >
      {options.map((v, i) => {
        if (isOption(v)) {
          return (
            <option value={v.value} key={i}>
              {v.text}
            </option>
          );
        }

        // optgroup process
        return (
          <optgroup label={v.group} key={i}>
            {v.values.map((w, j) => (
              <option value={w.value} key={j}>
                {w.text}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
});

export default Selector;
