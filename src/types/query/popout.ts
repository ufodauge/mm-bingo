import { LayoutName } from "../layout";
import { LineType } from "../lineType";
import { ThemeName } from "../theme/theme";

export type PopoutQuery = {
  seed    : string;
  header  : LineType;
  layout  : LayoutName;
  lang    : string;
  theme   : ThemeName;
};

