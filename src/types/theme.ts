import { blue, green, grey, orange, red, yellow } from "@mui/material/colors";
import {
  type PaletteOptions,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import { type CSSProperties } from "react";

export type HEX = `#${string}`;

// Constants which define colors later:
export const themeColors: { [key: string]: HEX } = {
  primary: blue[600],
  secondary: grey[200],
  error: red[600], // also audio Record icons
  warning: orange[300],
  success: green[600], // also audio Play icons
  highlight: yellow[200],
  lightShade: blue[700], // AppBarTypes.ts
  darkShade: blue[900], // AppBarTypes.ts
  recordIdle: red[500], // RecorderIcon.tsx
  recordActive: red[900], // RecorderIcon.tsx
};

// Constants used in multiple themes
const palette: PaletteOptions = {
  primary: { main: themeColors.primary },
  secondary: { main: themeColors.secondary },
  error: { main: themeColors.error },
  warning: { main: themeColors.warning },
  success: { main: themeColors.success },
  background: { default: themeColors.secondary },
  contrastThreshold: 3,
  tonalOffset: 0.2,
};

const fontFamily: CSSProperties["fontFamily"] = [
  "'Noto Sans'",
  "'Open Sans'",
  "Roboto",
  "Helvetica",
  "Arial",
  "sans-serif",
].join(",");

const dynamicFontParams = { factor: 2 };

// Theme for the entire project
const baseTheme = createTheme({
  components: {
    MuiButtonBase: { styleOverrides: { root: { disableRipple: false } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: ".8em" } } },
  },
  palette,
  spacing: 8,
  typography: { button: { textTransform: "none" }, fontFamily },
});

// Can have a number of additional options passed in; here, sticks with defaults
export default responsiveFontSizes(baseTheme, dynamicFontParams);

// A 20-color palette from https://grafify-vignettes.netlify.app/colour_palettes.html#graf-hex
export const colorblindSafePalette: { [key: number]: HEX } = {
  1: "#f3c300",
  2: "#875692",
  3: "#f38400",
  4: "#a1caf1",
  5: "#be0032",
  6: "#c2b280",
  7: "#848482",
  8: "#008856",
  9: "#e68fac",
  10: "#0067a5",
  11: "#f99379",
  12: "#604e97",
  13: "#f6a600",
  14: "#b3446c",
  15: "#dcd300",
  16: "#882d17",
  17: "#8db600",
  18: "#654522",
  19: "#e25822",
  20: "#2b3d26",
};
