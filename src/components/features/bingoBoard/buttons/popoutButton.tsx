import { ButtonHTMLAttributes } from "react";

import Button from "@/components/ui/button";
import { useBingoBoardContext } from "@/contexts/bingoBoard";
import { useThemeValue } from "@/contexts/theme";
import { CalcPopupWindowFeatures } from "@/lib/calcPopupWindowFeatures";
import { getTargetTasksByLineType } from "@/lib/utils/getTargetTasksByLineType";
import { LineType } from "@/types/lineType";
import { PopoutQuery } from "@/types/query/popout";
import { css, useTheme } from "@emotion/react";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { useLanguageValue } from "@/contexts/language";

type Props = {
  lineType: LineType;
};

const isDevEnv = process.env.NODE_ENV === "development";

export default function PopoutButton({ lineType }: Props) {
  const { BoardActions, BoardValues } = useBingoBoardContext();
  const { tasks, layout } = BoardValues;

  const { updateTargetedLine } = BoardActions;
  const { languageName } = useLanguageValue();

  const { themeName } = useThemeValue();

  const targetTasks = getTargetTasksByLineType(tasks, lineType);

  const { repoName } = useTaskData();

  const url = `${isDevEnv ? "" : repoName}/popout`;
  const params: PopoutQuery = {
    tasks: targetTasks.map((v) => v.index).join(";"),
    header: lineType,
    layout: lineType === "card" ? "card" : layout,
    lang: languageName,
    theme: themeName,
  };

  const taskData = useTaskData();

  const onClick = () => {
    const features = CalcPopupWindowFeatures(
      lineType === "card" ? "card" : layout,
      taskData.size
    );
    window.open(
      `${url}?${Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join("&")}`,
      "_blank",
      features
    );
  };
  const onMouseOver = () => updateTargetedLine(lineType);
  const onMouseOut = () => updateTargetedLine();

  const customProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    onMouseOver,
    onMouseOut,
  };

  const theme = useTheme();

  const style = css({
    fontSize: "large",
    backgroundColor: theme.baseVariant,
    color: theme.baseContent,
    "&:hover": {
      color: theme.primaryContent,
      borderColor: theme.primary,
      borderStyle: "solid",
      borderWidth: "2px",
    },
  });

  return (
    <Button
      customProps={customProps}
      customStyle={style}
      onClick={onClick}
      outlined
    >
      <p>{lineType}</p>
    </Button>
  );
}
