/* eslint-disable react-hooks/exhaustive-deps */
import React, { ChangeEventHandler, useCallback } from 'react';

import Selector, { Options } from '@/components/ui/selector';
import { useLanguageAction, useLanguageValue } from '@/contexts/language';
import { useTaskData } from '@/lib/hooks/useTaskData';
import { SerializedStyles } from '@emotion/react';

type Props = {
  customStyle?: SerializedStyles;
};

const LanguageSelector = React.memo<Props>(function LanguageSelector({
  customStyle,
}) {
  const taskData = useTaskData();
  const { setLanguage } = useLanguageAction();
  const { languageName } = useLanguageValue();

  const onSetLanguage: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (v) => {
      setLanguage(v.target.value);
    },
    []
  );

  const languageOptions: Options = taskData.lang.map((v) => {
    return { text: v.toUpperCase(), value: v };
  });

  return (
    <Selector
      options={languageOptions}
      customStyle={customStyle}
      onChange={onSetLanguage}
      value={languageName}
    />
  );
});

export default LanguageSelector;
