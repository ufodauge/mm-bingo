import { css } from "@emotion/react";

type Props = {};

const EditorLayout: React.FC<Props> = () => {
  const style = css({
    width: "50vmin",
    height: "50vmin",
  });

  return (
    <div css={style}>
      
    </div>
  );
};

export default EditorLayout;
