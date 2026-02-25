import { StrictMode } from 'react';
import './index.css';
import './popup.css';
import { Popup } from '../pages/Popup';
import { router } from './router';

router(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
