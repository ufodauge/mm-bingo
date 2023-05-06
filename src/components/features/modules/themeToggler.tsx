import { ButtonHTMLAttributes } from 'react';

import MdiThemeLightDark from '@/components/svg/ThemeLightDark';
import Button from '@/components/ui/button';
import { useThemeAction } from '@/contexts/theme';
import { css } from '@emotion/react';

type Props = {};

const ThemeToggler: React.FC<Props> = () => {
  const { toggle } = useThemeAction();

  const customProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    onClick: toggle,
  };
  const customStyle = css({
    height: "3rem",
    width: "3rem",
    borderRadius: "9999px",
  });

  return (
    <Button
      customProps={customProps}
      customStyle={customStyle}
      ghost
    >
      <MdiThemeLightDark width="2em" height="2em" />
    </Button>
  );
};

export default ThemeToggler;
