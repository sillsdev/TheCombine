import {
  blue,
  green,
  grey,
  orange,
  red,
  yellow,
} from "@material-ui/core/colors";
import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";

import { Path } from "browserHistory";

// Constants which define colors later:
export const themeColors = {
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
const palette = {
  type: "light",
  primary: {
    main: themeColors.primary,
  },
  secondary: {
    main: themeColors.secondary,
  },
  error: {
    main: themeColors.error,
  },
  background: {
    default: themeColors.secondary,
  },
  contrastThreshold: 3,
  tonalOffset: 0.2,
};

const typography = {
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
  props: {
    MuiButtonBase: {
      disableRipple: false,
    },
  },
});

export function tabColor(currentTab: Path, tabName: Path) {
  return currentTab.indexOf(tabName) !== -1 ? themeColors.shade : "inherit";
}

// Can have a number of additional options passed in; here, sticks with defaults
export default responsiveFontSizes(baseTheme, dynamicFontParams);
