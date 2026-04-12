import { type TrackerCounterParams } from "./counter";
import { type TrackerTogglerParams } from "./toggler";
import { type TrackerHeartPieceParams } from "./heartPiece";

export type Tracker =
  | {
      type: "counter";
      properties: TrackerCounterParams;
    }
  | {
      type: "heart-piece";
      properties: TrackerHeartPieceParams;
    }
  | {
      type: "toggler";
      properties: TrackerTogglerParams;
    };
