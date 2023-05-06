import BingoBoard from "@/components/features/bingoBoard";
import ThemeToggler from "@/components/features/modules/themeToggler";
import MainBoard from "@/components/layouts/mainBoard";
import Header from "@/components/ui/header";
import BingoBoardWrapper from "@/contexts/bingoBoard";
import ThemeWrapper from "@/contexts/theme";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { css } from "@emotion/react";

type Props = {};

const Home: React.FC<Props> = () => {
  const taskData = useTaskData();

  const style = css({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1.5rem",
  });

  return (
    <ThemeWrapper>
      <Header text={taskData.title}>
        <ThemeToggler />
      </Header>
      <div css={style}>
        <BingoBoardWrapper>
          <BingoBoard />
          <MainBoard />
        </BingoBoardWrapper>
      </div>
    </ThemeWrapper>
  );
};

export default Home;
