export const COLOR_NUMBER_REGEX = /[+-]?\d+(\.\d+)?|[\s]?\.\d+|#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/gi;
export const HEX_NAME_COLOR = /#[a-f\d]{3,}|transparent|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|burntsienna|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen/gi;

interface classNameType {
  [name: string]: string;
}

// Named colors
export const colorNames: classNameType = {
  transparent: "#00000000",
  aliceblue: "#f0f8ffff",
  antiquewhite: "#faebd7ff",
  aqua: "#00ffffff",
  aquamarine: "#7fffd4ff",
  azure: "#f0ffffff",
  beige: "#f5f5dcff",
  bisque: "#ffe4c4ff",
  black: "#000000ff",
  blanchedalmond: "#ffebcdff",
  blue: "#0000ffff",
  blueviolet: "#8a2be2ff",
  brown: "#a52a2aff",
  burlywood: "#deb887ff",
  burntsienna: "#ea7e5dff",
  cadetblue: "#5f9ea0ff",
  chartreuse: "#7fff00ff",
  chocolate: "#d2691eff",
  coral: "#ff7f50ff",
  cornflowerblue: "#6495edff",
  cornsilk: "#fff8dcff",
  crimson: "#dc143cff",
  cyan: "#00ffffff",
  darkblue: "#00008bff",
  darkcyan: "#008b8bff",
  darkgoldenrod: "#b8860bff",
  darkgray: "#a9a9a9ff",
  darkgreen: "#006400ff",
  darkgrey: "#a9a9a9ff",
  darkkhaki: "#bdb76bff",
  darkmagenta: "#8b008bff",
  darkolivegreen: "#556b2fff",
  darkorange: "#ff8c00ff",
  darkorchid: "#9932ccff",
  darkred: "#8b0000ff",
  darksalmon: "#e9967aff",
  darkseagreen: "#8fbc8fff",
  darkslateblue: "#483d8bff",
  darkslategray: "#2f4f4fff",
  darkslategrey: "#2f4f4fff",
  darkturquoise: "#00ced1ff",
  darkviolet: "#9400d3ff",
  deeppink: "#ff1493ff",
  deepskyblue: "#00bfffff",
  dimgray: "#696969ff",
  dimgrey: "#696969ff",
  dodgerblue: "#1e90ffff",
  firebrick: "#b22222ff",
  floralwhite: "#fffaf0ff",
  forestgreen: "#228b22ff",
  fuchsia: "#ff00ffff",
  gainsboro: "#dcdcdcff",
  ghostwhite: "#f8f8ffff",
  gold: "#ffd700ff",
  goldenrod: "#daa520ff",
  gray: "#808080ff",
  green: "#008000ff",
  greenyellow: "#adff2fff",
  grey: "#808080ff",
  honeydew: "#f0fff0ff",
  hotpink: "#ff69b4ff",
  indianred: "#cd5c5cff",
  indigo: "#4b0082ff",
  ivory: "#fffff0ff",
  khaki: "#f0e68cff",
  lavender: "#e6e6faff",
  lavenderblush: "#fff0f5ff",
  lawngreen: "#7cfc00ff",
  lemonchiffon: "#fffacdff",
  lightblue: "#add8e6ff",
  lightcoral: "#f08080ff",
  lightcyan: "#e0ffffff",
  lightgoldenrodyellow: "#fafad2ff",
  lightgray: "#d3d3d3ff",
  lightgreen: "#90ee90ff",
  lightgrey: "#d3d3d3ff",
  lightpink: "#ffb6c1ff",
  lightsalmon: "#ffa07aff",
  lightseagreen: "#20b2aaff",
  lightskyblue: "#87cefaff",
  lightslategray: "#778899ff",
  lightslategrey: "#778899ff",
  lightsteelblue: "#b0c4deff",
  lightyellow: "#ffffe0ff",
  lime: "#00ff00ff",
  limegreen: "#32cd32ff",
  linen: "#faf0e6ff",
  magenta: "#ff00ffff",
  maroon: "#800000ff",
  mediumaquamarine: "#66cdaaff",
  mediumblue: "#0000cdff",
  mediumorchid: "#ba55d3ff",
  mediumpurple: "#9370dbff",
  mediumseagreen: "#3cb371ff",
  mediumslateblue: "#7b68eeff",
  mediumspringgreen: "#00fa9aff",
  mediumturquoise: "#48d1ccff",
  mediumvioletred: "#c71585ff",
  midnightblue: "#191970ff",
  mintcream: "#f5fffaff",
  mistyrose: "#ffe4e1ff",
  moccasin: "#ffe4b5ff",
  navajowhite: "#ffdeadff",
  navy: "#000080ff",
  oldlace: "#fdf5e6ff",
  olive: "#808000ff",
  olivedrab: "#6b8e23ff",
  orange: "#ffa500ff",
  orangered: "#ff4500ff",
  orchid: "#da70d6ff",
  palegoldenrod: "#eee8aaff",
  palegreen: "#98fb98ff",
  paleturquoise: "#afeeeeff",
  palevioletred: "#db7093ff",
  papayawhip: "#ffefd5ff",
  peachpuff: "#ffdab9ff",
  peru: "#cd853fff",
  pink: "#ffc0cbff",
  plum: "#dda0ddff",
  powderblue: "#b0e0e6ff",
  purple: "#800080ff",
  rebeccapurple: "#663399ff",
  red: "#ff0000ff",
  rosybrown: "#bc8f8fff",
  royalblue: "#4169e1ff",
  saddlebrown: "#8b4513ff",
  salmon: "#fa8072ff",
  sandybrown: "#f4a460ff",
  seagreen: "#2e8b57ff",
  seashell: "#fff5eeff",
  sienna: "#a0522dff",
  silver: "#c0c0c0ff",
  skyblue: "#87ceebff",
  slateblue: "#6a5acdff",
  slategray: "#708090ff",
  slategrey: "#708090ff",
  snow: "#fffafaff",
  springgreen: "#00ff7fff",
  steelblue: "#4682b4ff",
  tan: "#d2b48cff",
  teal: "#008080ff",
  thistle: "#d8bfd8ff",
  tomato: "#ff6347ff",
  turquoise: "#40e0d0ff",
  violet: "#ee82eeff",
  wheat: "#f5deb3ff",
  white: "#ffffffff",
  whitesmoke: "#f5f5f5ff",
  yellow: "#ffff00ff",
  yellowgreen: "#9acd32ff",
};

function conv3to6(hex: string) {
  const regex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

  return hex.replace(regex, function (_, r, g, b) {
    return "#" + r + r + g + g + b + b;
  });
}

function conv6to8(hex: string) {
  if (hex.length === 7) {
    return hex + "FF";
  }

  return hex;
}

export function hexToRgba(hex: string) {
  const hex6: string = conv3to6(hex);
  const hex8: string = conv6to8(hex6);
  const hexRgba: any = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex8,
  );

  return {
    r: parseInt(hexRgba[1], 16),
    g: parseInt(hexRgba[2], 16),
    b: parseInt(hexRgba[3], 16),
    a: parseInt(hexRgba[4], 16) / 255,
  };
}

export function rgbaToHex(rgba: {
  r: number;
  g: number;
  b: number;
  a: number;
}) {
  const { r, g, b, a } = rgba;

  const hexR = (r | (1 << 8)).toString(16).slice(1);
  const hexG = (g | (1 << 8)).toString(16).slice(1);
  const hexB = (b | (1 << 8)).toString(16).slice(1);
  const hexA = ((a * 255) | (1 << 8)).toString(16).slice(1);

  return "#" + hexR + hexG + hexB + hexA;
}

export function processColor(color: number | string) {
  if (typeof color === "number") {
    const alpha = ((color >> 24) & 255) / 255;
    const red = (color >> 16) & 255;
    const green = (color >> 8) & 255;
    const blue = color & 255;

    return { r: red, g: green, b: blue, a: alpha };
  } else {
    // If string then check whether it has # in 0 index
    if (color[0] === "#") {
      return hexToRgba(color);
    } else {
      // It is string color
      const hexColorName: string = colorNames[color];
      if (hexColorName) {
        return hexToRgba(hexColorName);
      } else {
        throw new Error("String cannot be parsed!");
      }
    }
  }
}
