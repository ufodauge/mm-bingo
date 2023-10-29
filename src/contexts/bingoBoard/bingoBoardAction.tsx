import { UnimplementedFunctionCalledException } from "@/class/exception/unimplementedFunctionCalled";
import { LayoutName } from "@/types/layout";
import { LineType } from "@/types/lineType";
import { createContext } from "react";

type BoardActionsProps = {
  setSeed           : React.Dispatch<React.SetStateAction<number>>;
  setLayout         : React.Dispatch<React.SetStateAction<LayoutName>>;
  updateTargetedLine: (lineType?: LineType) => void;
  updateTasks       : (seed: number, lang: string) => void;
};

export const BoardActionsContext = createContext<BoardActionsProps>({
  setSeed: () => {
    throw new UnimplementedFunctionCalledException();
  },
  updateTargetedLine: () => {
    throw new UnimplementedFunctionCalledException();
  },
  setLayout: () => {
    throw new UnimplementedFunctionCalledException();
  },
  updateTasks: () => {
    throw new UnimplementedFunctionCalledException();
  },
});
