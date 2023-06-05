import { blue, green, grey, orange, red, yellow } from "@mui/material/colors";
import {
  createTheme,
  responsiveFontSizes,
  PaletteOptions,
} from "@mui/material/styles";
import { TypographyOptions } from "@mui/material/styles/createTypography";

import { Path } from "browserHistory";

export type HEX = `#${string}`;

// Constants which define colors later:
export const themeColors: { [key: string]: HEX } = {
  primary: blue[600],
  secondary: grey[200],
  error: red[600],
  warn: orange[300],
  success: green[600],
  highlight: yellow[200],
  shade: blue[700], // tabColor()
  recordIdle: red[500], // RecorderIcon.tsx
  recordActive: red[900], // RecorderIcon.tsx
};

// Constants used in multiple themes
const palette: Partial<PaletteOptions> = {
  primary: { main: themeColors.primary },
  secondary: { main: themeColors.secondary },
  error: { main: themeColors.error },
  background: { default: themeColors.secondary },
  contrastThreshold: 3,
  tonalOffset: 0.2,
};

const typography: Partial<TypographyOptions> = {
  // Copied from default theme
  fontFamily: [
    '"Roboto"',
    '"Noto Sans"',
    '"Helvetica"',
    '"Arial"',
    "sans-serif",
  ].join(","),
};

const dynamicFontParams = { factor: 2 };

// Theme for the entire project
const baseTheme = createTheme({
  typography: { ...typography },
  palette: { ...palette } as PaletteOptions,
  spacing: 8,
  components: {
    MuiButtonBase: { styleOverrides: { root: { disableRipple: false } } },
  },
});

// Can have a number of additional options passed in; here, sticks with defaults
export default responsiveFontSizes(baseTheme, dynamicFontParams);

export function tabColor(currentTab: Path, tabName: Path): string {
  return currentTab.indexOf(tabName) !== -1 ? themeColors.shade : "inherit";
}

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
