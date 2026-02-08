import { atomWithStorage } from "jotai/utils";
import { createRandomColor } from "../../libs/color";

export const colorThemeAtom = atomWithStorage<"light" | "dark" | "system">(
  "page:theme",
  "system",
  undefined,
  { getOnInit: true },
);

export const themeColorVarKeys = [
  "--color-primary",
  "--color-primary-content",
  "--color-secondary",
  "--color-secondary-content",
  "--color-accent",
  "--color-accent-content",
  "--color-neutral",
  "--color-neutral-content",
  "--color-base-100",
  "--color-base-200",
  "--color-base-300",
  "--color-base-content",
  "--color-info",
  "--color-info-content",
  "--color-success",
  "--color-success-content",
  "--color-warning",
  "--color-warning-content",
  "--color-error",
  "--color-error-content",
] as const;

type Enabled<T> = {
  enabled: boolean;
  value: T;
};

export type ThemeColorVars = {
  ["--color-primary"]: Enabled<string>;
  ["--color-primary-content"]: Enabled<string>;
  ["--color-secondary"]: Enabled<string>;
  ["--color-secondary-content"]: Enabled<string>;
  ["--color-accent"]: Enabled<string>;
  ["--color-accent-content"]: Enabled<string>;
  ["--color-neutral"]: Enabled<string>;
  ["--color-neutral-content"]: Enabled<string>;
  ["--color-base-100"]: Enabled<string>;
  ["--color-base-200"]: Enabled<string>;
  ["--color-base-300"]: Enabled<string>;
  ["--color-base-content"]: Enabled<string>;
  ["--color-info"]: Enabled<string>;
  ["--color-info-content"]: Enabled<string>;
  ["--color-success"]: Enabled<string>;
  ["--color-success-content"]: Enabled<string>;
  ["--color-warning"]: Enabled<string>;
  ["--color-warning-content"]: Enabled<string>;
  ["--color-error"]: Enabled<string>;
  ["--color-error-content"]: Enabled<string>;
};

export const customThemeColorVarsAtom = atomWithStorage<ThemeColorVars>(
  "page:custom-theme",
  {
    ["--color-primary"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-primary-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-secondary"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-secondary-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-accent"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-accent-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-neutral"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-neutral-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-base-100"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-base-200"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-base-300"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-base-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-info"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-info-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-success"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-success-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-warning"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-warning-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-error"]: {
      enabled: false,
      value: createRandomColor(),
    },
    ["--color-error-content"]: {
      enabled: false,
      value: createRandomColor(),
    },
  },
  undefined,
  { getOnInit: true },
);
