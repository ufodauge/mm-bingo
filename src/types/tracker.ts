export const TrackerNames = ["counter", "toggler"] as const;

export type TrackerName = typeof TrackerNames[number];
export const isTrackerName = (v: string): v is TrackerName =>
  TrackerNames.includes(v as TrackerName);

export type CounterTrackerProps = {
  max: number;
  init?: number;
  icon?: string;
};

// CounterTrackerProps 型ガード
export const isCounterTrackerProps = (
  props: any
): props is CounterTrackerProps => {
  return (
    typeof props === "object" &&
    typeof props.max === "number" &&
    (props.init === undefined || typeof props.init === "number") &&
    (props.icon === undefined || typeof props.icon === "string")
  );
};

export type TogglerTrackerProps = {
  icons: string[];
};

// TogglerTrackerProps 型ガード
export const isTogglerTrackerProps = (
  props: any
): props is TogglerTrackerProps => {
  return (
    typeof props === "object" &&
    Array.isArray(props.icons) &&
    props.icons.every((icon: any) => typeof icon === "string")
  );
};

export type Tracker = {
  type: string;
  properties: CounterTrackerProps | TogglerTrackerProps;
};
