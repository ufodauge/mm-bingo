import { ButtonHTMLAttributes, memo } from 'react';

import Button from '@/components/ui/button';
import { useBingoBoardActionsContext, useBingoBoardValuesContext } from '@/contexts/bingoBoard';
import { useLanguageValue } from '@/contexts/language';
import { useThemeValue } from '@/contexts/theme';
import { CalcPopupWindowFeatures } from '@/lib/calcPopupWindowFeatures';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { LineType } from '@/types/lineType';
import { PopoutQuery } from '@/types/query/popout';

import * as style from './popoutButton.css';

type Props = {
  lineType: LineType;
};

const PopoutButton = memo<Props>(function PopoutButton({ lineType }) {
  const { languageName }       = useLanguageValue();
  const taskData               = useTaskData();
  const { themeName }          = useThemeValue();
  const { layout, seed }       = useBingoBoardValuesContext();
  const { updateTargetedLine } = useBingoBoardActionsContext();

  const repoName = taskData.repoName;

  const url = `${isDevEnv ? "" : repoName}/popout`;
  const params: PopoutQuery = {
    seed  : seed.toString(),
    header: lineType,
    layout: lineType === "card" ? "card": layout,
    lang  : languageName,
    theme : themeName,
  };

  const onClick = () => {
    const features = CalcPopupWindowFeatures(
      lineType === "card" ? "card" : layout,
      taskData.size
    );

    const paramString = Object.entries(params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    window.open(`${url}?${paramString}`, "_blank", features);
  };

  const onMouseOver = () => updateTargetedLine(lineType);
  const onMouseOut = () => updateTargetedLine();

  const customProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    onMouseOver,
    onMouseOut,
    onClick,
  };

  return (
    <Button customProps={customProps} customStyle={style.css} outlined>
      <p>{innerTextFormatter(lineType)}</p>
    </Button>
  );
});

const isDevEnv = process.env.NODE_ENV === "development";

const innerTextFormatter = (lineType: LineType) => {
  if (["bltr", "tlbr", "card"].includes(lineType)) {
    return lineType.toUpperCase();
  }

  const rowExpected = /^row(\d)$/.exec(lineType);
  if (rowExpected !== null) {
    return `R${rowExpected.at(1) ?? "?"}`;
  }

  const colExpected = /^col(\d)$/.exec(lineType);
  if (colExpected !== null) {
    return `C${colExpected.at(1) ?? "?"}`;
  }
};

export default PopoutButton;
