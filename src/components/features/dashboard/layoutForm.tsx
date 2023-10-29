import { ChangeEventHandler, memo, useCallback } from 'react';

import Label from '@/components/ui/label';
import Selector, { Options } from '@/components/ui/selector';
import { useBingoBoardActionsContext } from '@/contexts/bingoBoard';
import { isLayoutName } from '@/types/layout';

export default memo(function LayoutForm() {
  const { setLayout } = useBingoBoardActionsContext();

  const layoutOptions: Options = [
    { text: "vertical", value: "vertical" },
    { text: "horizontal", value: "horizontal" },
  ];

  const onSetLayout: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (v) => {
      const layout = v.target.value;
      if (isLayoutName(layout)) {
        setLayout(layout);
      }
    },
    [setLayout]
  );

  return (
    <>
      <Label>Layout</Label>
      <Selector options={layoutOptions} onChange={onSetLayout} />
    </>
  );
});
