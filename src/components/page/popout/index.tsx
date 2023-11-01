import PopoutWindow from "@/components/layouts/popoutWindow";
import LanguageProvider from "@/contexts/language";
import ThemeWrapper from "@/contexts/theme";
import BingoBoardWrapper from '@/contexts/bingoBoard';

type Props = {};

const Home: React.FC<Props> = () => {
  return (
    <ThemeWrapper>
      <LanguageProvider>
        <BingoBoardWrapper>
          <PopoutWindow />
        </BingoBoardWrapper>
      </LanguageProvider>
    </ThemeWrapper>
  );
};

export default Home;
