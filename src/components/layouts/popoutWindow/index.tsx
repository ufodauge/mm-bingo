import { css } from "@emotion/react";

import PopoutWindowUI from "@/components/features/popoutWindow";

type Props = {};

const PopoutWindow: React.FC<Props> = () => {
  const style = css({
    width: "100vw",
    height: "100vh",
  });
  return (
    <div css={style}>
      <PopoutWindowUI />
    </div>
  );
};

export default PopoutWindow;
