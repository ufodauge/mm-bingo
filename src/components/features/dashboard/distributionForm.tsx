import dayjs, { Dayjs } from 'dayjs';
import { ChangeEventHandler, Dispatch, memo, SetStateAction, useCallback } from 'react';

import DateInput from '@/components/ui/dateinput';
import Label from '@/components/ui/label';

const DEFAULT_MINUTES_OFFSET = 30;

type Props = { setDistributeTime: Dispatch<SetStateAction<Dayjs>> };

export default memo(function DistributionForm({ setDistributeTime }: Props) {
  const currentTime = dayjs();
  const defaultTime = currentTime.second(
    currentTime.second() + DEFAULT_MINUTES_OFFSET * 60
  );

  const onDistributeTimeChanged: ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (v) =>
        setDistributeTime(
          dayjs(v.target.valueAsNumber).subtract(
            currentTime.utcOffset(),
            "minute"
          )
        ),
      [currentTime, setDistributeTime]
    );

  return (
    <>
      <Label>Distribution</Label>
      <DateInput defaultTime={defaultTime} onChange={onDistributeTimeChanged} />
    </>
  );
});
