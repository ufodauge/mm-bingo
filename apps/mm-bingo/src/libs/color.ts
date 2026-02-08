export const calculatePreferredTextColor = (rgb: `#${string}`): string => {
  try {
    const [r, g, b] = [
      Number.parseInt(rgb.slice(1, 3), 16),
      Number.parseInt(rgb.slice(3, 5), 16),
      Number.parseInt(rgb.slice(5, 7), 16),
    ];

    if (r * 0.299 + g * 0.587 + b * 0.114 > 186) {
      return "#000000";
    } else {
      return "#ffffff";
    }
  } catch {
    // TODO: Return err
    return "#000000";
  }
};

export const createRandomColor = (): `#${string}` => {
  return `#${Math.floor(Math.random() * 0x1000000)
    .toString(16)
    .padStart(6, "0")}`;
};
