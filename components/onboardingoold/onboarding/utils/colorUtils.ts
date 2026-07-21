
export const hexToRgb = (hex: string): [number, number, number] | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s ? s * 100 : 0, l * 100];
};

export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export const getComplementaryColor = (hex: string): string | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);
  const complementaryH = (h + 180) % 360;
  const [cr, cg, cb] = hslToRgb(complementaryH, s, l);
  return `#${((1 << 24) + (cr << 16) + (cg << 8) + cb).toString(16).slice(1)}`;
};

export const getTriadicColors = (hex: string): string[] | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);

  const h1 = h;
  const h2 = (h + 120) % 360;
  const h3 = (h + 240) % 360;

  const [r1, g1, b1] = hslToRgb(h1, s, l);
  const [r2, g2, b2] = hslToRgb(h2, s, l);
  const [r3, g3, b3] = hslToRgb(h3, s, l);

  const hex1 = `#${((1 << 24) + (r1 << 16) + (g1 << 8) + b1).toString(16).slice(1)}`;
  const hex2 = `#${((1 << 24) + (r2 << 16) + (g2 << 8) + b2).toString(16).slice(1)}`;
  const hex3 = `#${((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1)}`;

  return [hex1, hex2, hex3];
};

export const getAnalogousColors = (hex: string): string[] | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);

  const h1 = (h - 30 + 360) % 360;
  const h2 = h;
  const h3 = (h + 30) % 360;

  const [r1, g1, b1] = hslToRgb(h1, s, l);
  const [r2, g2, b2] = hslToRgb(h2, s, l);
  const [r3, g3, b3] = hslToRgb(h3, s, l);

  const hex1 = `#${((1 << 24) + (r1 << 16) + (g1 << 8) + b1).toString(16).slice(1)}`;
  const hex2 = `#${((1 << 24) + (r2 << 16) + (g2 << 8) + b2).toString(16).slice(1)}`;
  const hex3 = `#${((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1)}`;

  return [hex1, hex2, hex3];
};

export const getTetradicColors = (hex: string): string[] | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);

  const h1 = h;
  const h2 = (h + 90) % 360;
  const h3 = (h + 180) % 360;
  const h4 = (h + 270) % 360;

  const [r1, g1, b1] = hslToRgb(h1, s, l);
  const [r2, g2, b2] = hslToRgb(h2, s, l);
  const [r3, g3, b3] = hslToRgb(h3, s, l);
  const [r4, g4, b4] = hslToRgb(h4, s, l);

  const hex1 = `#${((1 << 24) + (r1 << 16) + (g1 << 8) + b1).toString(16).slice(1)}`;
  const hex2 = `#${((1 << 24) + (r2 << 16) + (g2 << 8) + b2).toString(16).slice(1)}`;
  const hex3 = `#${((1 << 24) + (r3 << 16) + (g3 << 8) + b3).toString(16).slice(1)}`;
  const hex4 = `#${((1 << 24) + (r4 << 16) + (g4 << 8) + b4).toString(16).slice(1)}`;

  return [hex1, hex2, hex3, hex4];
};

export const getMonochromaticColors = (hex: string, count: number = 5): string[] | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const newL = Math.max(0, Math.min(100, l + (i - Math.floor(count / 2)) * (100 / count)));
    const [cr, cg, cb] = hslToRgb(h, s, newL);
    colors.push(`#${((1 << 24) + (cr << 16) + (cg << 8) + cb).toString(16).slice(1)}`);
  }
  return colors;
};

export const getLogoColor = (backgroundColor: string): string | null => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return null;
  const [r, g, b] = rgb;

  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export type ColorPalette = {
  primary: string;
  secondary?: string;
  tertiary?: string;
  quaternary?: string;
  logo: string;
};

export const generateColorPalette = (baseColor: string): ColorPalette | null => {
  const primary = baseColor;
  const complementary = getComplementaryColor(baseColor);
  const triadic = getTriadicColors(baseColor);
  const analogous = getAnalogousColors(baseColor);
  const tetradic = getTetradicColors(baseColor);
  const monochromatic = getMonochromaticColors(baseColor);

  const logoColor = getLogoColor(baseColor);

  if (!logoColor) return null;

  // For simplicity, let's use a triadic palette if available, otherwise complementary, otherwise monochromatic
  if (triadic && triadic.length >= 3) {
    return {
      primary: primary,
      secondary: triadic[1],
      tertiary: triadic[2],
      logo: logoColor,
    };
  } else if (complementary) {
    return {
      primary: primary,
      secondary: complementary,
      logo: logoColor,
    };
  } else if (monochromatic && monochromatic.length >= 2) {
    return {
      primary: primary,
      secondary: monochromatic[1],
      logo: logoColor,
    };
  } else {
    return {
      primary: primary,
      logo: logoColor,
    };
  }
};


