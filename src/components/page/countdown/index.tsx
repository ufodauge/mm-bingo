import CountdownLayout from "@/components/layouts/countdownLayout";
import ThemeWrapper from "@/contexts/theme";
import { css } from "@emotion/react";

type Props = {};

const CountdownPage: React.FC<Props> = () => {
  const style = css({
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });
  return (
    <ThemeWrapper>
      <div css={style}>
        <CountdownLayout />
      </div>
    </ThemeWrapper>
  );
};

export default CountdownPage;
