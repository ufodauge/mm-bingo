import { memo } from "react";

import {
  useBingoBoardActionsContext,
  useBingoBoardValuesContext,
} from "@/contexts/bingoBoard";
import { useLanguageValue } from "@/contexts/language";
import { useThemeValue } from "@/contexts/theme";
import { CalcPopupWindowFeatures } from "@/lib/calcPopupWindowFeatures";
import { useTaskData } from "@/lib/hooks/useTaskData";
import { LineType } from "@/types/lineType";
import { PopoutQuery } from "@/types/query/popout";

import * as style from "./popoutButton.css";
import Button from "@/components/ui/button";

type Props = {
  lineType: LineType;
};

const PopoutButton = memo<Props>(function PopoutButton({ lineType }) {
  const { languageName } = useLanguageValue();
  const taskData = useTaskData();
  const { themeName } = useThemeValue();
  const { seed, layout } = useBingoBoardValuesContext();
  const { updateTargetedLine } = useBingoBoardActionsContext();

  const repoName = taskData.repoName;

  const url = `${isDevEnv ? "" : repoName}/popout`;
  const params: PopoutQuery = {
    seed: seed.toString(),
    header: lineType,
    layout: layout,
    lang: languageName,
    theme: themeName,
  };

  const onClick = () => {
    const features = CalcPopupWindowFeatures(layout, taskData.size);

    const paramString = Object.entries(params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    window.open(`${url}?${paramString}`, "_blank", features);
  };

  const onMouseOver = () => updateTargetedLine(lineType);
  const onMouseOut = () => updateTargetedLine();

  const customProps = {
    onMouseOver,
    onMouseOut,
    onClick,
  };

  return (
    <Button customProps={customProps} customStyle={style.css}>
      <p>{innerTextFormatter(lineType)}</p>
    </Button>
  );
});

const isDevEnv = process.env.NODE_ENV === "development";

const innerTextFormatter = (lineType: LineType) => {
  if (["bltr", "tlbr", "card"].includes(lineType)) {
    return lineType.toUpperCase();
  }

  const isRow = /^row(\d)$/.exec(lineType);
  if (isRow !== null) {
    return `R${isRow.at(1) ?? "?"}`;
  }

  const isCol = /^col(\d)$/.exec(lineType);
  if (isCol !== null) {
    return `C${isCol.at(1) ?? "?"}`;
  }
};

export default PopoutButton;
