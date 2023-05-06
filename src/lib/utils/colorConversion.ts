// https://gist.github.com/Kamilczak020/47e51ab27810529b343111df435a01fb

/**
 * Representation of color in HSL (hue, saturation, luminance) format.
 */
type HslColor = {
  h: number;
  s: number;
  l: number;
};

type ColorCode = `#${string}`;

/**
 * Converts hex color string to hsl object
 * @param color color string in hex representation
 */
export const hexToHsl = (color: ColorCode): HslColor => {
  const [r, g, b] = color
    .match(/\w\w/g)
    ?.map((hex) => parseInt(hex, 16) / 255) ?? [0, 0, 0];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case r:
        h = 60 * (((g - b) / delta) % 6);
        break;
      case g:
        h = 60 * ((b - r) / delta + 2);
        break;
      case b:
        h = 60 * ((r - g) / delta + 4);
        break;
    }
  }
  return {
    h: Math.floor(h),
    s: Math.floor(s * 100),
    l: Math.floor(l * 100),
  };
};

/**
 * Convert HSL color object to hex string
 * @param color color object in HSL representation
 */
export const hslToHex = ({ h, s, l }: HslColor) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [c, x, 0];
  if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
  if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
  if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
  if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
  if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];
  return `#${[r, g, b]
    .map((value) =>
      Math.round((value + m) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
};
