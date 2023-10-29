import { ReactNode, memo } from "react";

import Title from "./title";
import { navbar, navbarEnd, navbarStart } from "./index.css";

type Props = { text: string; children?: ReactNode };

const Header = memo<Props>(function Header({ text, children }) {
  return (
    <div className={navbar}>
      <div className={navbarStart}>
        <Title text={text} />
      </div>
      <div className={navbarEnd}>{children}</div>
    </div>
  );
});

export default Header;
