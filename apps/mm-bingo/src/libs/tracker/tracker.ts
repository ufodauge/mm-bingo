import { type TrackerCounterParams } from "./counter";
import { type TrackerHeartPieceParams } from "./heartPiece";
import { type TrackerTogglerParams } from "./toggler";

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
