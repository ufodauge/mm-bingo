import { ThemeName } from "../theme/theme";

export type CountdownQuery = {
  seed: string;
  release: string;
  lang: string;
  theme: ThemeName;
  gist?: string;
};