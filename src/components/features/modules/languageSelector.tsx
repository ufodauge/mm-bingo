/* eslint-disable react-hooks/exhaustive-deps */
import React, { ChangeEventHandler, memo, useCallback } from 'react';

import Selector, { Options } from '@/components/ui/selector';
import { useLanguageAction, useLanguageValue } from '@/contexts/language';
import { useTaskData } from '@/lib/hooks/useTaskData';

type Props = {
  customClassName?: string;
};

const LanguageSelector = memo<Props>(function LanguageSelector({
  customClassName,
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
      options         = {languageOptions}
      customClassName = {customClassName}
      onChange        = {onSetLanguage}
      value           = {languageName}
    />
  );
});

export default LanguageSelector;
