import { container } from "./header.css";

type Props = { text: string };

const Header: React.FC<Props> = ({ text }) => {  
  return <div className={container}>{text}</div>;
};

export default Header;
