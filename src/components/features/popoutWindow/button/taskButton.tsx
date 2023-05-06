import { useState } from 'react';

import { HighlightColors } from '@/const/highlightColors';
import { MouseButton } from '@/const/mouseButton';
import { Task } from '@/types/task';
import { isCounterTrackerProps, isTogglerTrackerProps } from '@/types/tracker';

import Counter from '../tracker/counter';
import Toggler from '../tracker/toggler';
import * as style from './taskButton.css';

type Props = {
  task: Task;
  disableTrackers: boolean;
};

const TaskButton: React.FC<Props> = ({ task, disableTrackers }) => {
  const [highlightColorIndex, setHighlightColorIndex] = useState(0);

  const highlightNext = () => {
    setHighlightColorIndex((highlightColorIndex + 1) % HighlightColors.length);
  };

  const highlightPrev = () => {
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
      highlightNext();
    } else if (e.button === MouseButton.Secondary) {
      highlightPrev();
    }
  };

  const trackerElements = task.trackers.map((v, i) => {
    if (v.type === 'toggler' && isTogglerTrackerProps(v.properties)) {
      return <Toggler key={i} icons={v.properties.icons} />;
    } else if (v.type === 'counter' && isCounterTrackerProps(v.properties)) {
      return (
        <Counter
          key={i}
          max={v.properties.max}
          init={v.properties.init ?? 0}
          icon={v.properties.icon}
        />
      );
    } else {
      return <p key={i}>???</p>;
    }
  });

  const container = [
    style.base,
    style.highlights.at(highlightColorIndex) ?? '',
  ].join(' ');

  return (
    <div
      className={container}
      onClick={toggleHighlightTypeIndex}
      onContextMenu={toggleHighlightTypeIndex}
    >
      <div className={style.taskText}>{task.text}</div>
      {disableTrackers ? <></> : <section>{trackerElements}</section>}
    </div>
  );
};

export default TaskButton;
