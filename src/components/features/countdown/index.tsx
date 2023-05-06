import { useState } from "react";

import CountdownUI from "@/components/ui/countdown";
import { Decode } from "@/lib/encoder";
import { useQuery } from "@/lib/hooks/useQuery";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { MainPageQuery } from "@/types/query/mainpage";
import { isThemeName } from "@/types/theme/theme";
import assert from "assert";

type Props = {};

const Countdown: React.FC<Props> = () => {
  const [count, setCount] = useState(0);
  const [getQuery, pushToMainPage] = useRouterPush<MainPageQuery>();

  useQuery(
    (v) => {
      const seed = Decode(v.seed);
      const releaseTime = Decode(v.release);

      const targetTime = new Date(Number(releaseTime)).getTime();

      const [_, query] = getQuery();

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetTime - now;

        const themeName = isThemeName(v.theme) ? v.theme : "light";

        assert(
          typeof query.gist === "string" || typeof query.gist === "undefined"
        );

        if (distance <= 0) {
          clearInterval(timer);
          pushToMainPage("/", {
            seed: Number(seed),
            lang: v.lang,
            theme: themeName,
            gist: query.gist,
          });
        } else {
          setCount(distance);
        }
      }, 10);

      return () => clearInterval(timer);
    },
    { seed: "", release: "", lang: "ja", theme: "light" }
  );

  return <CountdownUI remains={count} />;
};

export default Countdown;
