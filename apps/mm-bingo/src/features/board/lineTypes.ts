type LineTypeColOrRow = `${"row" | "col"}${number}`;
export type LineType = `${"card" | "tlbr" | "bltr" | LineTypeColOrRow}`;
export const isLineType = (v: string): v is LineType => {
  if (v === "card" || v === "tlbr" || v === "bltr") {
    return true;
  }
  if (v.startsWith("row") || v.startsWith("col")) {
    const num = Number.parseInt(v.slice(3));
    return !Number.isNaN(num) && num > 0;
  }
  return false;
};

export const createLineTypeNames = (size: number): LineType[] => {
  return [
    "tlbr",
    ...Array.from({ length: size }, (_, i) => `col${i + 1}` as LineType),
    ...Array.from({ length: size }, (_, i) => `row${i + 1}` as LineType),
    "bltr",
    "card",
  ];
};
