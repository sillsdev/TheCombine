/*
import AbyssinicaSIL_Regular from "resources/fonts/AbyssinicaSIL/AbyssinicaSIL-Regular.woff2";
import AnnapurnaSIL_Bold from "resources/fonts/AnnapurnaSIL/AnnapurnaSIL-Bold.woff";
import AnnapurnaSIL_Regular from "resources/fonts/AnnapurnaSIL/AnnapurnaSIL-Regular.woff";
import CharisSIL_Bold from "resources/fonts/CharisSIL/CharisSIL-Bold.woff2";
import CharisSIL_BoldItalic from "resources/fonts/CharisSIL/CharisSIL-BoldItalic.woff2";
import CharisSIL_Italic from "resources/fonts/CharisSIL/CharisSIL-Italic.woff2";
import CharisSIL_Regular from "resources/fonts/CharisSIL/CharisSIL-Regular.woff2";
*/

enum FontFamily {
  AbyssinicaSIL = "Abyssinica SIL",
  AnnapurnaSIL = "Annapurna SIL",
  AwamiNastaliq = "Awami Nastaliq",
  CharisSIL = "Charis SIL",
  DaiBannaSIL = "Dai Banna SIL",
  DoulosSIL = "Doulos SIL",
  GalatiaSIL = "Galatia", // SIL dropped in Mui-Language-Picker
  GentiumPlus = "Gentium Plus",
  Harmattan = "Harmattan",
  Namdhinggo = "Namdhinggo SIL", // SIL added in Mui-Language-Picker
  Narnoor = "Narnoor",
  Nokyung = "Nokyung",
  NuosuSIL = "Nuosu SIL",
  Padauk = "Padauk",
  ScheherazadeNew = "Scheherazade", // New dropped in Mui-Language-Picker
  Shimenkan = "Shimenkan",
  SophiaNubian = "Sophia Nubian",
  TaiHeritagePro = "Tai Heritage Pro",
}

export class Font {
  family: FontFamily;
  format: "ttf" | "woff" | "woff2";
  style?: "normal" | "italic";
  weight?: 300 | 400 | 500 | 600 | 700 | 800;

  constructor(
    family: FontFamily,
    format: "ttf" | "woff" | "woff2",
    style?: "normal" | "italic",
    weight?: 300 | 400 | 500 | 600 | 700 | 800
  ) {
    this.family = family;
    this.format = format;
    this.style = style;
    this.weight = weight;
  }
}

export default ``;
/*
@font-face {
  font-display: swap;
  font-family: 'Abyssinica SIL';
  src: local('Abyssinica SIL'), local('Abyssinica SIL Regular'), url(${AbyssinicaSIL_Regular}) format('woff2')
}
@font-face {
  font-display: swap;
  font-family: 'Annapurna SIL';
  font-weight: normal;
  src: local('Annapurna SIL'), local('Annapurna SIL Regular'), url(${AnnapurnaSIL_Regular}) format('woff2')
}
@font-face {
  font-display: swap;
  font-family: 'Annapurna SIL';
  font-weight: bold;
  src: local('Annapurna SIL Bold'), url(${AnnapurnaSIL_Bold}) format('woff');
}
@font-face {
  font-display: swap;
  font-family: 'Charis SIL';
  font-style: normal;
  font-weight: normal;
  src: local('Charis SIL'), local('Charis SIL Regular'), url(${CharisSIL_Regular}) format('woff')
}
@font-face {
  font-display: swap;
  font-family: 'Charis SIL';
  font-style: normal;
  font-weight: bold;
  src: local('Charis SIL Bold'), url(${CharisSIL_Bold}) format('woff2');
}
@font-face {
  font-display: swap;
  font-family: 'Charis SIL';
  font-style: italic;
  font-weight: normal;
  src: local('Charis SIL Italic'), url(${CharisSIL_Italic}) format('woff2');
}
@font-face {
  font-display: swap;
  font-family: 'Charis SIL';
  font-style: italic;
  font-weight: bold;
  src: local('Charis SIL Bold Italic'), url(${CharisSIL_BoldItalic}) format('woff2');
}
`;
*/
