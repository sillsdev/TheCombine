import { blue, green, grey, red, yellow } from "@material-ui/core/colors";
import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";

import { Path } from "../history";

// Constants which define colors later:
const primary: string = blue[600];
const secondary: string = grey[200];
const accent: string = grey[900];
const error: string = red[600];
const hover: string = blue[100];

export const buttonSuccess = green[500]; // createProjectComponent and RegisterComponent
export const highlight = yellow[100]; // goals/CharInventoryCreation/components/SampleWords/WordTileComponent.tsx

export const shade = blue[700]; //Buttons on AppBar Component

export const accepted = green[600];
export const rejected = red[600];

// Constants used in multiple themes
const palette = {
  type: "light",
  primary: {
    main: primary,
  },
  secondary: {
    main: secondary,
  },
  error: {
    main: error,
  },
  background: {
    default: secondary,
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
const baseTheme = createMuiTheme({
  typography: { ...typography },
  palette: { ...palette } as PaletteOptions,
  spacing: 8,
  props: {
    MuiButtonBase: {
      disableRipple: false,
    },
  },
});

// Theme used when dynamic cards wanted
export const dynamicTheme = responsiveFontSizes(
  createMuiTheme({
    typography: { ...typography },
    palette: { ...palette } as PaletteOptions,
    spacing: 8,
    props: {
      MuiButtonBase: {
        disableRipple: false,
      },
    },
    overrides: {
      MuiButton: {
        root: {
          color: accent,
          backgroundColor: primary,
          "&:hover": {
            color: primary,
            backgroundColor: hover,
          },
        },
      },
      MuiCard: {
        root: {
          color: grey[900],
          backgroundColor: primary,
          "&:hover": {
            color: primary,
            backgroundColor: hover,
          },
        },
      },
    },
  }),
  dynamicFontParams
);

// Additional styles used by various components
export const styleAddendum = {
  inactive: {
    color: grey[600],
    backgroundColor: grey[400],
  },
};

// Used in IconHolder
export const recorderStatus = {
  idle: {
    color: red[500],
  },
  active: {
    color: red[900],
  },
};

export function tabColor(currentTab: Path, tabName: Path) {
  const colors = ["inherit", shade];
  if (currentTab === tabName) {
    return colors[1];
  } else return colors[0];
}

// Can have a number of additional options passed in; here, sticks with defaults
export default responsiveFontSizes(baseTheme, dynamicFontParams);
