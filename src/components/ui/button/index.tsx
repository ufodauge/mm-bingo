import React, { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import { css, SerializedStyles, useTheme } from '@emotion/react';

type Props = {
  customProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onRightClick?: MouseEventHandler<HTMLButtonElement>;
  outlined?: boolean;
  ghost?: boolean;
  children?: ReactNode;
  customStyle?: SerializedStyles;
};

const Button: React.FC<Props> = React.memo<Props>(function Button({
  children,
  onClick,
  onRightClick,
  customProps,
  outlined,
  ghost,
  customStyle,
}) {
  const theme = useTheme();

  const style = {
    default: css({
      padding: 0,
      border: theme.base,
      borderRadius: "10px",
      cursor: "pointer",
      display: "inline-flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      fontWeight: "bold",
      backgroundColor: theme.neutral,
      color: theme.neutralContent,
      transitionProperty: "color background-color font-weight",
      transitionDuration: "0.2s",
      transitionTimingFunction: "ease-in-out",
      "&:hover": {
        backgroundColor: theme.primary,
        color: theme.primaryContent,
      },
      "&:active": {
        backgroundColor: theme.primaryVariant,
        color: theme.primaryContent,
      },
    }),
    ghost: css({
      backgroundColor: "transparent",
      color: theme.baseContent,
      "&:hover": {
        backgroundColor: theme.primary,
        color: theme.primaryContent,
      },
      "&:active": {
        backgroundColor: theme.primaryVariant,
        color: theme.primaryContent,
      },
    }),
    outlined: css({
      backgroundColor: theme.base,
      borderStyle: "solid",
      borderWidth: "2px",
      borderColor: theme.neutral,
      color: theme.baseContent,
      "&:hover": {
        backgroundColor: theme.primary,
        color: theme.primaryContent,
      },
      "&:active": {
        backgroundColor: theme.primaryVariant,
        color: theme.primaryContent,
      },
    }),
  };

  const styles = [
    style.default,
    outlined ? style.outlined : null,
    ghost ? style.ghost : null,
    customStyle,
  ];

  const rightClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onRightClick) {
      e.preventDefault();
      onRightClick(e);
    }
  };

  return (
    <button
      type="button"
      css={styles}
      onClick={onClick}
      onContextMenu={rightClick}
      {...customProps}
    >
      {children}
    </button>
  );
});

export default Button;
