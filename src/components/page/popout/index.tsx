import PopoutWindow from "@/components/layouts/popoutWindow";
import LanguageProvider from "@/contexts/language";
import ThemeWrapper from "@/contexts/theme";

type Props = {};

const Home: React.FC<Props> = () => {
  return (
    <ThemeWrapper>
      <LanguageProvider>
        <PopoutWindow />
      </LanguageProvider>
    </ThemeWrapper>
  );
};

export default Home;
