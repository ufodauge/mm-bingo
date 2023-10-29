import { ButtonHTMLAttributes, memo } from "react";

import MdiThemeLightDark from "@/components/svg/ThemeLightDark";
import Button from "@/components/ui/button";
import { useThemeAction } from "@/contexts/theme";
import { BUTTON_HEIGHT, BUTTON_WIDTH, container } from "./themeToggler.css";

const ThemeToggler = memo(function ThemeToggler() {
  const { toggle } = useThemeAction();

  const customProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    onClick: toggle,
  };

  return (
    <Button customProps={customProps} customStyle={container} ghost>
      <MdiThemeLightDark
        width  = {`${BUTTON_WIDTH * 0.6}rem`}
        height = {`${BUTTON_HEIGHT * 0.6}rem`}
      />
    </Button>
  );
});

export default ThemeToggler;
