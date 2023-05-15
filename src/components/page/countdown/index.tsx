import ThemeToggler from "@/components/features/modules/themeToggler";
import CountdownLayout from "@/components/layouts/countdownLayout";
import Header from "@/components/ui/header";
import LanguageProvider from "@/contexts/language";
import ThemeWrapper from "@/contexts/theme";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { css } from "@emotion/react";

type Props = {};

const CountdownPage: React.FC<Props> = () => {
  const style = {
    header: css({
      zIndex: 50,
    }),
    main: css({
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
    }),
  };

  const taskData = useTaskData();

  return (
    <ThemeWrapper>
      <LanguageProvider>
        <div css={style.header}>
          <Header text={taskData.title}>
            <ThemeToggler />
          </Header>
        </div>
        <div css={style.main}>
          <CountdownLayout />
        </div>
      </LanguageProvider>
    </ThemeWrapper>
  );
};

export default CountdownPage;
