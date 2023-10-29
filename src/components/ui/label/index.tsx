import { ReactNode, memo } from 'react';

import { container, text } from './index.css';

type Props = { children: ReactNode };

const Label = memo<Props>(function Label({ children })  {
  return (
    <label className={container}>
      <span className={text}>{children}</span>
    </label>
  );
});

export default Label;
