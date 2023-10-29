import ThemeToggler from '@/components/features/modules/themeToggler';
import CountdownLayout from '@/components/layouts/countdownLayout';
import Header from '@/components/ui/header';
import LanguageProvider from '@/contexts/language';
import ThemeWrapper from '@/contexts/theme';
import { useTaskData } from '@/lib/hooks/useTaskData';

import * as style from './index.css';

const CountdownPage: React.FC = () => {
  const taskData = useTaskData();

  return (
    <ThemeWrapper>
      <LanguageProvider>
        <div className={style.header}>
          <Header text={taskData.title}>
            <ThemeToggler />
          </Header>
        </div>
        <div className={style.main}>
          <CountdownLayout />
        </div>
      </LanguageProvider>
    </ThemeWrapper>
  );
};

export default CountdownPage;
