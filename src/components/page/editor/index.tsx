import EditorLayout from "@/components/layouts/editorLayout";
import ThemeWrapper from "@/contexts/theme";

type Props = {};

const EditorPage: React.FC<Props> = () => {
  return (
    <ThemeWrapper>
      <div>
        <EditorLayout />
      </div>
    </ThemeWrapper>
  );
};

export default EditorPage;
