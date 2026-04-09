export const NAMED_COLORS: Record<string, string> = {
  red: 'FF0000',
  crimson: 'DC143C',
  orangered: 'FF4500',
  coral: 'FF7F50',
  orange: 'FF8000',
  gold: 'FFD700',
  yellow: 'FFFF00',
  chartreuse: '7FFF00',
  springgreen: '00FF7F',
  green: '00FF00',
  aquamarine: '7FFFD4',
  turquoise: '40E0D0',
  teal: '008080',
  cyan: '00FFFF',
  deepskyblue: '00BFFF',
  dodgerblue: '1E90FF',
  royalblue: '4169E1',
  navy: '000080',
  blue: '0000FF',
  indigo: '4B0082',
  blueviolet: '8A2BE2',
  purple: '800080',
  magenta: 'FF00FF',
  deeppink: 'FF1493',
  hotpink: 'FF69B4',
  violet: 'EE82EE',
  brown: 'A52A2A',
  white: 'FFFFFF',
};

export const COLOR_NAMES = Object.keys(NAMED_COLORS);

export function isValidColor(value: string): boolean {
  if (/^[0-9A-Fa-f]{6}$/.test(value)) return true;
  return value.toLowerCase() in NAMED_COLORS;
}

export function resolveColor(value: string): string {
  const lower = value.toLowerCase();
  return NAMED_COLORS[lower] || value;
}
