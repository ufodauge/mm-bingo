import { memo } from 'react';

import BingoBoard from '@/components/features/bingoBoard';
import LanguageSelector from '@/components/features/modules/languageSelector';
import ThemeToggler from '@/components/features/modules/themeToggler';
import MainBoard from '@/components/layouts/mainBoard';
import Header from '@/components/ui/header';
import BingoBoardWrapper from '@/contexts/bingoBoard';
import LanguageProvider from '@/contexts/language';
import ThemeWrapper from '@/contexts/theme';
import { useTaskData } from '@/lib/hooks/useTaskData';

import * as style from './index.css';

const Home = memo(function Home() {
  const taskData = useTaskData();

  return (
    <ThemeWrapper>
      <LanguageProvider>
        <Header text={taskData.title}>
          <LanguageSelector customClassName={style.lang} />
          <ThemeToggler />
        </Header>
        <div className={style.main}>
          <BingoBoardWrapper>
            <BingoBoard />
            <MainBoard />
          </BingoBoardWrapper>
        </div>
      </LanguageProvider>
    </ThemeWrapper>
  );
});

export default Home;
