import { useRouter } from "next/router";
import { useEffect } from "react";

export const useQuery = <T extends { [key in string]: string }>(
  callback: (v: { [key in keyof T]: string }) => void,
  defaultValues: T
) => {
  const router = useRouter();
  const query = router.query;

  useEffect(
    () => {
      if (Object.keys(defaultValues).length === 0 || !router.isReady) return;

      const values: { [key in keyof T]: string } = Object.assign(
        {},
        defaultValues
      );

      for (const key in defaultValues) {
        const val = query[key];
        if (val !== undefined && typeof val === "string") {
          values[key] = val;
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
