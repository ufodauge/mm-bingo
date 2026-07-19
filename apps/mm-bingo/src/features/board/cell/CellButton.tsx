import type { DetailedHTMLProps, HTMLAttributes } from "react";

const classCell =
  "btn size-full justify-center items-center select-none content-center";

export const CellButton = ({
  role,
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  return <div role={role} className={`${classCell} ${className}`} {...props} />;
};
