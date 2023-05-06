export const LayoutNames = ["horizontal", "vertical", "card"] as const;
export type LayoutName = typeof LayoutNames[number];

export const isLayoutName = (v: string): v is LayoutName =>
  LayoutNames.includes(v as LayoutName);
