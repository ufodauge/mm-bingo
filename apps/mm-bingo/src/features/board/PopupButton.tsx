import type { PropsWithChildren, ReactNode } from "react";
import type { LineType } from "./lineTypes";
import { CellButton } from "./CellButton";
import { useAtomValue } from "jotai";
import { seedNumberAtom } from "../store/seed";
import { nav } from "../../routes/nav";

const classNameBase = `bg-base-200 text-xs`;

type Props = {
  target: LineType;
  className?: string;
} & (
  | {
      inert: true;
    }
  | {
      inert?: false;
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

  return (
    <CellButton
      onClick={async () => {
        if (rest.inert === true) {
          return;
        }

        const { availWidth: width, availHeight: height } = window.screen;
        const ratio = window.devicePixelRatio;
        const left = ((width - rest.width) / 2) * ratio;
        const top = ((height - rest.height) / 2) * ratio;

        const url = nav.getNavLink("popup");
        url.searchParams.append("seed", `${seed}`);
        url.searchParams.append("target", `${target}`);

        window.open(
          url,
          "_blank",
          `left=${left},top=${top},width=${rest.width / ratio},height=${rest.height / ratio}`,
        );
      }}
      className={`${classNameBase} ${className}`}
      inert={rest.inert}
    >
      {children}
    </CellButton>
  );
};
