import React from 'react';

import Countdown from '@/components/features/countdown';

import { container } from './index.css';

const CountdownLayout = React.memo(function CountdownLayout() {
  return (
    <div className={container}>
      <Countdown />
    </div>
  );
});

export default CountdownLayout;
