import ReactMarkdown from "react-markdown";

import { useTaskData } from "@/lib/hooks/useTaskData";
import { useLanguageValue } from "@/contexts/language";
import { container } from "./index.css";

type Props = {};

const Description: React.FC<Props> = () => {
  const { description } = useTaskData();
  const { languageName } = useLanguageValue();

  return (
    <div className={container}>
      <ReactMarkdown>{description[languageName]}</ReactMarkdown>
    </div>
  );
};

export default Description;
