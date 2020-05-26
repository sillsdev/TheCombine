import createMuiTheme from "@material-ui/core/styles/createMuiTheme";

// Import colors
import { blue, grey, red, green, yellow } from "@material-ui/core/colors";
import { responsiveFontSizes } from "@material-ui/core/styles";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";

// Constants which define colors later:
const primary: string = blue[600];
const secondary: string = grey[200];
const accent: string = grey[900];
const error: string = red[600];
const hover: string = blue[100];

export const buttonSuccess = green[500]; // createProjectComponent and RegisterComponent
export const highlight = yellow[100]; // goals/CharInventoryCreation/components/SampleWords/WordTileComponent.tsx

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
  fontFamily: ['"Roboto"', '"Helvetica"', '"Arial"', "sans-serif"].join(","),
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

// Can have a number of additional options passed in; here, sticks with defaults
export default responsiveFontSizes(baseTheme, dynamicFontParams);
