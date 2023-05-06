export const ThemeNames = ["light", "dark"] as const;

export type ThemeName = (typeof ThemeNames)[number];
export const isThemeName = (v: string): v is ThemeName =>
  ThemeNames.includes(v as ThemeName);

  