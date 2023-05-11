import { useState } from "react";

import CountdownUI from "@/components/ui/countdown";
import { decrypt } from "@/lib/encoder";
import { useQuery } from "@/lib/hooks/useQuery";
import { useRouterPush } from "@/lib/hooks/useRouterPush";
import { MainPageQuery } from "@/types/query/mainpage";
import { isThemeName } from "@/types/theme/theme";
import { CountdownQuery } from "@/types/query/countdown";
import { SEP } from "@/const/crypto";

type Props = {};

const Countdown: React.FC<Props> = () => {
  const [count, setCount] = useState(0);
  const [_, pushToMainPage] = useRouterPush<MainPageQuery>();

  useQuery<CountdownQuery>(
    (v) => {
      const text = decrypt(v.code, v.key);
      const [seed, releaseTime] = text.split(SEP);

      const targetTime = new Date(Number(releaseTime)).getTime();

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetTime - now;

        const themeName = isThemeName(v.theme) ? v.theme : "light";

        if (distance <= 0) {
          clearInterval(timer);
          pushToMainPage("/", {
            seed: Number(seed),
            lang: v.lang,
            theme: themeName,
          });
        } else {
          setCount(distance);
        }
      }, 10);

      return () => clearInterval(timer);
    },
    { code: "", key: "", lang: "ja", theme: "light" }
  );

  return <CountdownUI remains={count} />;
};

export default Countdown;
