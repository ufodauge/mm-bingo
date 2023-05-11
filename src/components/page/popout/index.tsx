import PopoutWindow from "@/components/layouts/popoutWindow";
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
      <Global styles={globalStyle} />
      <PopoutWindow />
    </ThemeWrapper>
  );
};

export default Home;
