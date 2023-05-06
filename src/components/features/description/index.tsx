import { useBingoBoardContext } from "@/contexts/bingoBoard";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { css, useTheme } from "@emotion/react";

type Props = {};

const Description: React.FC<Props> = () => {
  const { description } = useTaskData();
  const { lang } = useBingoBoardContext().BoardValues;
  const theme = useTheme();

  const style = css({
    color: theme.baseContent,
  });
  return <div css={style}>{description[lang]}</div>;
};

export default Description;
