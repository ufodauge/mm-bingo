import PopoutWindow from "@/components/layouts/popoutWindow";
import LanguageProvider from "@/contexts/language";
import ThemeWrapper from "@/contexts/theme";
import { Global, css } from "@emotion/react";

type Props = {};

const Home: React.FC<Props> = () => {
  const globalStyle = css({
    html: {
      "::-webkit-scrollbar": {
        display: "none"
      },
      scrollbarWidth: "none"
    },
  });
  return (
    <ThemeWrapper>
      <LanguageProvider>
        <Global styles={globalStyle} />
        <PopoutWindow />
      </LanguageProvider>
    </ThemeWrapper>
  );
};

export default Home;
