import { title } from "./index.css";

type Props = { text: string };

const Title: React.FC<Props> = ({ text }) => {
  return <span className={title}>{text}</span>;
};

export default Title;
