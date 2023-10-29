import { ButtonHTMLAttributes, useState } from "react";

import Button from "@/components/ui/button";
import { HighlightColors } from "@/const/highlightColors";
import { MouseButton } from "@/const/mouseButton";
import { useBingoBoardValuesContext } from "@/contexts/bingoBoard";
import { LineType } from "@/types/lineType";
import * as style from "./taskButton.css";

type Props = {
  lineTypes : LineType[];
  text      : string;
  slotNumber: number;
};

export default function TaskButton({ lineTypes, text, slotNumber }: Props) {
  const { targetedLine } = useBingoBoardValuesContext();

  const [highlightColorIndex, setHighlightColorIndex] = useState(0);

  /**
   * set highlight color next
   */
  const highlightColorNext = () => {
    setHighlightColorIndex((highlightColorIndex + 1) % HighlightColors.length);
  };

  /**
   * set hight light color prev
   */
  const highlightColorPrev = () => {
    setHighlightColorIndex(
      (highlightColorIndex + HighlightColors.length - 1) %
        HighlightColors.length
    );
  };

  /**
   * toggler to change highlight color
   * @param e mouse event
   */
  const toggleHighlightColorIndex: React.MouseEventHandler<
    HTMLButtonElement
  > = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (e.button === MouseButton.Primary) {
      highlightColorNext();
    } else if (e.button === MouseButton.Secondary) {
      highlightColorPrev();
    }
  };

  const [isMouseOver, setIsMouseOver] = useState(false);
  const onMouseOver: React.MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsMouseOver(true);
  };
  const onMouseLeave: React.MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsMouseOver(false);
  };

  const customProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    onClick      : toggleHighlightColorIndex,
    onContextMenu: toggleHighlightColorIndex,
    id           : `slot-${slotNumber}`,
    onMouseOver,
    onMouseLeave,
  };

  const isTargeted =
    isMouseOver ||
    (targetedLine !== undefined && lineTypes.includes(targetedLine));

  const classNames = [
    style.base,
    isTargeted ? style.targeted : "",
    style.highlights[highlightColorIndex]
  ].join(" ");

  return (
    <Button
      customProps = {customProps}
      customStyle = {classNames}
      outlined
    >
      <p suppressHydrationWarning>{text}</p>
    </Button>
  );
}
