import { useCallback, useReducer, type MouseEventHandler } from "react";
import { IconRemove } from "../../../libs/icons/Remove";
import { IconAdd } from "../../../libs/icons/Add";

const classNameBtn =
  "btn btn-soft bg-base-100/20 hover:bg-base-100/30 active:bg-base-100/50 border border-base-300";

type Props = {
  max: number;
  textColor: string | undefined;
  init?: number;
  icon?: string;
};

export const Counter = ({ max, init, icon, textColor }: Props) => {
  const [count, dispatcher] = useReducer(
    (prev, action: { type: "increment" | "decrement" }) => {
      switch (action.type) {
        case "decrement":
          return prev <= 0 ? prev : prev - 1;

        case "increment":
          return prev >= max ? prev : prev + 1;
      }
    },
    init ?? 0,
  );

  const increment = useCallback<MouseEventHandler<HTMLButtonElement>>((e) => {
    e.stopPropagation();
    dispatcher({ type: "increment" });
  }, []);

  const decrement = useCallback<MouseEventHandler<HTMLButtonElement>>((e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatcher({ type: "decrement" });
  }, []);

  return (
    <div className="flex place-items-center gap-1">
      <button
        className={`${classNameBtn} btn-circle btn-xs fill-current`}
        style={{
          fill: textColor,
        }}
        onClick={decrement}
      >
        <IconRemove />
      </button>
      <button
        className={`${classNameBtn} bg-transparent px-2`}
        onClick={increment}
        onContextMenu={decrement}
      >
        {icon ? <img src={icon} alt="" className="size-6" /> : <></>}
        <span
          className="font-mono text-xl"
          style={{
            color: textColor,
          }}
        >
          {count}
        </span>
        <span
          className="font-mono"
          style={{
            color: textColor,
          }}
        >
          /{max}
        </span>
      </button>
      <button
        className={`${classNameBtn} btn-circle btn-xs fill-current`}
        style={{
          fill: textColor,
        }}
        onClick={increment}
      >
        <IconAdd />
      </button>
    </div>
  );
};
