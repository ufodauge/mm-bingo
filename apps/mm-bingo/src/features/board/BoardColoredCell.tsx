import { useMemo, type ReactNode } from "react";
import { calculatePreferredTextColor } from "../../libs/color";
import { useMarkerColorsValue } from "../store/colors/colors";
import { useColorIndices, useSetColorIndices } from "../store/colors/indices";
import { CellButton } from "./CellButton";
import type { Cell } from "../store/board";
import { Counter } from "./tracker/Counter";
import { Toggler } from "./tracker/Toggler";
import { useTranslation } from "react-i18next";

type Props = {
  cell: Cell;
  className?: string;
  showTrackers?: boolean;
};

export const BoardColoredCell = ({
  cell,
  className,
  showTrackers,
}: Props): ReactNode => {
  const { i18n } = useTranslation();
  const colorIndices = useColorIndices();
  const colors = useMarkerColorsValue();
  const setColorIndices = useSetColorIndices();

  const colorIndex = colorIndices.at(cell.index);
  const activeColor =
    colorIndex === 0
      ? "var(--color-base-100)"
      : colorIndex
        ? colors.at(colorIndex - 1)
        : "transparent";

  const textColor = useMemo(
    () =>
      activeColor && activeColor.startsWith("#")
        ? calculatePreferredTextColor(activeColor as `#${string}`)
        : undefined,
    [activeColor],
  );

  return (
    <CellButton
      className={`${className} @container translate-0`}
      onClick={() =>
        setColorIndices({
          action: "set-at",
          index: cell.index,
          to: "next",
        })
      }
      onContextMenu={(e) => {
        e.preventDefault();
        setColorIndices({
          action: "set-at",
          index: cell.index,
          to: "prev",
        });
      }}
      style={{
        backgroundColor: activeColor,
      }}
    >
      <p
        className="grid text-center text-[min(14cqw,1.125rem)] wrap-anywhere break-keep"
        style={{
          color: textColor,
        }}
      >
        {cell.text[i18n.language] ?? cell.text["en"]}
      </p>

      {showTrackers ? (
        cell.trackers.map((v, i) => {
          switch (v.type) {
            case "counter": {
              const { max, icon, init } = v.properties;
              return (
                <div className="grid justify-center" key={i}>
                  <Counter
                    init={init}
                    max={max}
                    icon={icon}
                    textColor={textColor}
                  />
                </div>
              );
            }

            case "toggler": {
              const { icons } = v.properties;
              return (
                <div className="grid justify-center" key={i}>
                  <Toggler icons={icons ?? []} />
                </div>
              );
            }
          }
        })
      ) : (
        <></>
      )}
    </CellButton>
  );
};
