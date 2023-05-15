import BingoBoard from "@/components/features/bingoBoard";
import LanguageSelector from "@/components/features/modules/languageSelector";
import ThemeToggler from "@/components/features/modules/themeToggler";
import MainBoard from "@/components/layouts/mainBoard";
import Header from "@/components/ui/header";
import BingoBoardWrapper from "@/contexts/bingoBoard";
import LanguageProvider from "@/contexts/language";
import ThemeWrapper from "@/contexts/theme";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { css, useTheme } from "@emotion/react";

type Props = {};

const Home: React.FC<Props> = () => {
  const taskData = useTaskData();
  const theme = useTheme();

  const styles = {
    main: css({
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "1.5em",
    }),
    lang: css({
      backgroundColor: "inherit",
      borderStyle: "none",
      width: "6em",
    }),
  };

  return (
    <ThemeWrapper>
      <LanguageProvider>
        <Header text={taskData.title}>
          <LanguageSelector customStyle={styles.lang} />
          <ThemeToggler />
        </Header>
        <div css={styles.main}>
          <BingoBoardWrapper>
            <BingoBoard />
            <MainBoard />
          </BingoBoardWrapper>
        </div>
      </LanguageProvider>
    </ThemeWrapper>
  );
};

export default Home;
