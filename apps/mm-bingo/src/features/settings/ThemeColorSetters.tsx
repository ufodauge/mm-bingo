import { useAtom } from "jotai";
import {
  customThemeColorVarsAtom as customThemeColorVarsAtom,
  themeColorVarKeys,
  type ThemeColorVars,
} from "../store/theme";
import { memo, useCallback } from "react";

type Props = {
  name: keyof ThemeColorVars;
  value: ThemeColorVars[keyof ThemeColorVars];
  toggleColor: (key: keyof ThemeColorVars, value: boolean) => void;
  setColor: (key: keyof ThemeColorVars, value: string) => void;
};

const ThemeColorSetter = memo(function ThemeColorSetter({
  name,
  value,
  setColor,
  toggleColor,
}: Props) {
  return (
    <div className="visibility-auto">
      <label className="label">{name.slice("--color-".length)}</label>
      <div className="grid grid-cols-[auto_1fr] gap-10 px-10">
        <input
          type="checkbox"
          className="toggle"
          checked={value.enabled}
          onChange={(e) => {
            toggleColor(name, e.currentTarget.checked);
          }}
        />
        {value.enabled ? (
          <input
            type="color"
            className="btn btn-xs reset-input-color px-0"
            value={value.value}
            onChange={(e) => setColor(name, e.currentTarget.value)}
          />
        ) : (
          <button
            className="btn btn-xs"
            style={{
              backgroundColor: `color-mix(in oklch, var(${name}) 20%, transparent)`,
            }}
          ></button>
        )}
      </div>
    </div>
  );
});

export const ThemeColorSetters = () => {
  const [themeColorVars, setThemeColorVars] = useAtom(customThemeColorVarsAtom);

  const toggleColor = useCallback(
    (key: keyof ThemeColorVars, value: boolean | "toggle") => {
      setThemeColorVars((p) => ({
        ...p,
        [key]: {
          enabled: value === "toggle" ? !p[key].enabled : value,
          value: p[key].value,
        },
      }));
    },
    [],
  );

  const setColor = useCallback((key: keyof ThemeColorVars, value: string) => {
    setThemeColorVars((p) => ({
      ...p,
      [key]: {
        enabled: p[key].enabled,
        value,
      },
    }));
  }, []);

  return (
    <fieldset className="fieldset grid max-h-48 gap-2 overflow-y-auto">
      {themeColorVarKeys.map((name) => (
        <ThemeColorSetter
          key={name}
          name={name}
          setColor={setColor}
          toggleColor={toggleColor}
          value={themeColorVars[name]}
        />
      ))}
    </fieldset>
  );
};
