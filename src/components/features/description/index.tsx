import ReactMarkdown from "react-markdown";

import { useTaskData } from "@/lib/hooks/useTaskData";
import { css, useTheme } from "@emotion/react";
import { useLanguageValue } from "@/contexts/language";

type Props = {};

const Description: React.FC<Props> = () => {
  const { description } = useTaskData();
  const { languageName } = useLanguageValue();
  const theme = useTheme();

  const style = css({
    color: theme.baseContent,
  });

  return (
    <div css={style}>
      <ReactMarkdown>{description[languageName]}</ReactMarkdown>
    </div>
  );
};

export default Description;
