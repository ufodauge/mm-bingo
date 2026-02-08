import { err, ok, type Result } from "../v20260208/result";
import {
  type TrackerCounterParams,
  trackerCounterParamsSchema,
} from "./counter";
import * as vb from "valibot";
import {
  type TrackerTogglerParams,
  trackerTogglerParamsSchema,
} from "./toggler";

export const TrackerNames = ["counter", "toggler"] as const;

export type TrackerName = (typeof TrackerNames)[number];
export const isTrackerName = (v: string): v is TrackerName =>
  TrackerNames.includes(v as TrackerName);

export const parseTrackerCounterParams = (
  props: unknown,
): Result<TrackerCounterParams, Error> => {
  const result = vb.safeParse(trackerCounterParamsSchema, props);
  return result.success ? ok(result.output) : err(Error("Invalid JSON"));
};

export const parseTrackerTogglerParams = (
  props: unknown,
): Result<TrackerTogglerParams, Error> => {
  const result = vb.safeParse(trackerTogglerParamsSchema, props);
  return result.success ? ok(result.output) : err(Error("Invalid JSON"));
};

export type Tracker =
  | {
      type: "counter";
      properties: TrackerCounterParams;
    }
  | {
      type: "toggler";
      properties: TrackerTogglerParams;
    };
