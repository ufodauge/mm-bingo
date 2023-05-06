import Countdown from "@/components/features/countdown";
import { css } from "@emotion/react";

type Props = {};

const CountdownLayout: React.FC<Props> = () => {
  const style = css({
    width: "50vmin",
    height: "50vmin",
  });

  return (
    <div css={style}>
      <Countdown />
    </div>
  );
};

export default CountdownLayout;
