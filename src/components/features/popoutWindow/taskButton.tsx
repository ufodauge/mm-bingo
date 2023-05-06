import { useState } from "react";

import { HighlightColors } from "@/const/highlightColors";
import { MouseButton } from "@/const/mouseButton";
import { Task } from "@/types/task";
import { isCounterTrackerProps, isTogglerTrackerProps } from "@/types/tracker";
import { css, keyframes, useTheme } from "@emotion/react";

import Counter from "./tracker/counter";
import Toggler from "./tracker/toggler";

type Props = {
  task: Task;
};

const TaskButton: React.FC<Props> = ({ task }) => {
  const [highlightColorIndex, setHighlightColorIndex] = useState(0);
  const theme = useTheme();

  const htNext = () => {
    setHighlightColorIndex((highlightColorIndex + 1) % HighlightColors.length);
  };

  const htPrev = () => {
    setHighlightColorIndex(
      (highlightColorIndex + HighlightColors.length - 1) %
        HighlightColors.length
    );
  };

  const toggleHighlightTypeIndex: React.MouseEventHandler<HTMLDivElement> = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (e.button === MouseButton.Primary) {
      htNext();
    } else if (e.button === MouseButton.Secondary) {
      htPrev();
    }
  };

  const trackerElements = task.trackers?.map((v, i) => {
    switch (v.type) {
      case "toggler":
        if (isTogglerTrackerProps(v.properties)) {
          return <Toggler key={i} icons={v.properties.icons} />;
        }

      case "counter":
        if (isCounterTrackerProps(v.properties)) {
          return (
            <Counter
              key={i}
              max={v.properties.max}
              init={v.properties.init ?? 0}
              icon={v.properties.icon}
            />
          );
        }

      default:
        return <p key={i}>???</p>;
    }
  });

  const highlights = [
    theme.highlightColor1,
    theme.highlightColor2,
    theme.highlightColor3,
    theme.highlightColor4,
  ];

  const highlightVariants = [
    theme.highlightColor1Variant,
    theme.highlightColor2Variant,
    theme.highlightColor3Variant,
    theme.highlightColor4Variant,
  ];

  const kf = keyframes({
    "0%": { boxShadow: `0 0 0 0 ${theme.primary}` },
    "100%": { boxShadow: `0 0 0 8px ${theme.primary}00` },
  });

  const style = {
    base: css({
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      cursor: "pointer",
      backgroundColor: highlights[highlightColorIndex],
      color: theme.highlightContent,
      transitionDuration: ".2s",
      userSelect: "none",
      "&:hover": {
        borderColor: theme.primary,
        backgroundColor: highlights[highlightColorIndex],
        color: theme.highlightContent,
        backgroundPosition: "right center",
        backgroundSize: "200% auto",
        animationName: kf,
        animationDuration: "1s",
        zIndex: "10",
      },
    }),
    taskText: css({
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      marginTop: "4px",
      marginBottom: "4px",
      fontWeight: "bold",
      fontSize: "1.2em",
    }),
    // trackers: css({
    //   display: "flex",
    //   flexDirection: "col",
    // }),
  };

  return (
    <div
      css={style.base}
      onClick={toggleHighlightTypeIndex}
      onContextMenu={toggleHighlightTypeIndex}
    >
      <div css={style.taskText}>{task.text}</div>
      <div>{trackerElements}</div>
    </div>
  );
};

export default TaskButton;
