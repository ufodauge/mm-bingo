import { useCallback, useReducer, type MouseEventHandler } from "react";

import { IconAdd } from "../../../../libs/icons/Add";
import { IconRemove } from "../../../../libs/icons/Remove";

const classNameBtn =
  "btn btn-soft bg-base-100/20 hover:bg-base-100/30 active:bg-base-100/50 border border-base-300";

const viewBoxWidth = 47;
const viewBoxHeight = 40;
const viewBoxGap = 2;

const viewBoxFns = [
  `xywh(${(viewBoxWidth + viewBoxGap) * 4}px 0px ${viewBoxWidth}px ${viewBoxHeight}px)`,
  `xywh(${viewBoxWidth + viewBoxGap}px 0px ${viewBoxWidth}px ${viewBoxHeight}px)`,
  `xywh(${(viewBoxWidth + viewBoxGap) * 2}px 0px ${viewBoxWidth}px ${viewBoxHeight}px)`,
  `xywh(${(viewBoxWidth + viewBoxGap) * 3}px 0px ${viewBoxWidth}px ${viewBoxHeight}px)`,
  `xywh(0px 0px ${viewBoxWidth}px ${viewBoxHeight}px)`,
];

type Props = {
  max: number;
  textColor: string | undefined;
  init?: number;
};

export const HeartPieces = ({ max, init, textColor }: Props) => {
  const [count, dispatcher] = useReducer(
    (prev, action: { type: "increment" | "decrement" }) => {
      switch (action.type) {
        case "decrement":
          return prev <= 0 ? prev : prev - 1;

        case "increment":
          return prev >= max ? prev : prev + 1;

        default: {
          action.type satisfies never;
          return prev;
        }
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
        className={`${classNameBtn} border-0 bg-transparent px-2`}
        onClick={increment}
        onContextMenu={decrement}
      >
        {Array.from({ length: Math.ceil(max / 4) }, (_, i) => {
          const index = Math.min(Math.max(count - i * 4, 0), 4);
          const viewBox = viewBoxFns.at(index);
          return (
            <img
              key={i}
              src="icons/hearts.webp"
              alt=""
              className="size-4"
              style={{
                objectViewBox: viewBox,
              }}
            />
          );
        })}
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
