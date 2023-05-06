import PopoutWindow from "@/components/layouts/popoutWindow";
import ThemeWrapper from "@/contexts/theme";

type Props = {};

const Home: React.FC<Props> = () => {
  return (
    <ThemeWrapper>
      <PopoutWindow />
    </ThemeWrapper>
  );
};

export default Home;
