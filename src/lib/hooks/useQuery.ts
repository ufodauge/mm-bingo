import { useRouter } from "next/router";
import { useEffect } from "react";

export const useQuery = <T extends { [key in string]: string }>(
  callback: (v: T) => void,
  defaultValues: T
) => {
  const router = useRouter();
  const query = router.query;

  useEffect(
    () => {
      if (Object.keys(defaultValues).length === 0 || !router.isReady) return;

      const values: T = Object.assign(
        {},
        defaultValues
      );

      for (const key in defaultValues) {
        const val = query[key];
        if (typeof val === "string") {
          values[key] = val as T[Extract<keyof T, string>];
        } else {
          values[key] = defaultValues[key];
        }
      }

      callback(values);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady]
  );
};

// useQuery( (v) => { setTheme(v.theme) }, { theme: "light" } );
