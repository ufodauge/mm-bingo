import { LayoutName } from "@/types/layout";
import { LineType } from "@/types/lineType";
import { Task } from "@/types/task";
import { createContext } from "react";

type BoardValuesProps = {
  seed         : number;
  tasks        : Task[];
  targetedLine?: LineType;
  layout       : LayoutName;
};

export const BoardValuesContext = createContext<BoardValuesProps>({
  seed  : 0,
  tasks : [],
  layout: "vertical",
});