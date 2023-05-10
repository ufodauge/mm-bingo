import { ThemeName } from "../theme/theme";

export type MainPageQuery = {
  seed: number;
  lang: string;
  theme: ThemeName;
};
