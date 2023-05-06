import DashBoard from "@/components/features/dashboard";
import Description from "@/components/features/description";
import { css } from "@emotion/react";

type Props = {};

const MainBoard: React.FC<Props> = () => {
  const style = css({
    display: "flex",
    flexDirection: "column",
    gap: "1em",
    width: "36em",
    alignItems: "baseline",
    padding: "2rem",
  });

  return (
    <div css={style}>
      <DashBoard />
      <Description />
    </div>
  );
};

export default MainBoard;
