import { useAtomValue } from "jotai";
import type { PropsWithChildren, ReactNode } from "react";

import { nav } from "../../routes/nav";
import { seedNumberAtom } from "../store/seed";
import { taskVersionAtom } from "../store/taskVersion";
import { CellButton } from "./cell/CellButton";
import type { LineType } from "./lineTypes";

const classNameBase = `bg-base-200 text-xs`;

type Props = {
  target: LineType;
  className?: string;
} & (
  | {
      clickable: false;
    }
  | {
      clickable?: true;
      width: number;
      height: number;
    }
);

export const PopupButton = ({
  target,
  className,
  children,
  ...rest
}: PropsWithChildren<Props>): ReactNode => {
  const seed = useAtomValue(seedNumberAtom);
  const version = useAtomValue(taskVersionAtom);

  return (
    <CellButton
      role={rest.clickable === false ? undefined : "button"}
      onClick={async () => {
        if (rest.clickable === false) {
          return;
        }

        const { availWidth: width, availHeight: height } = window.screen;
        const ratio = window.devicePixelRatio;
        const left = ((width - rest.width) / 2) * ratio;
        const top = ((height - rest.height) / 2) * ratio;

        const url = nav.getNavLink(
          `popup-${target === "card" ? "card" : "row"}`,
        );
        url.searchParams.append("seed", `${seed}`);
        url.searchParams.append("version", version.toString());
        url.searchParams.append("target", `${target}`);

        window.open(
          url,
          "_blank",
          `left=${left},top=${top},width=${rest.width / ratio},height=${rest.height / ratio}`,
        );
      }}
      className={`${classNameBase} ${className}`}
    >
      {children}
    </CellButton>
  );
};
