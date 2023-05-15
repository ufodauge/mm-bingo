import { LineType } from "./lineType";
import { Tracker } from "./tracker";

export type Task = {
  index: number;
  difficulty: number;
  text: string;
  filter: bigint;
  lineTypes: LineType[];
  trackers: Tracker[];
};
