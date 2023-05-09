import { WritingSystem } from "api/models";

export enum Bcp47Code {
  Default = "en",
  Ar = "ar", // Arabic
  En = "en", // English
  Es = "es", // Spanish
  Fr = "fr", // French
  Pt = "pt", // Portuguese
}

const writingSystem = {
  [Bcp47Code.Ar]: newWritingSystem(Bcp47Code.Ar, "اَلْعَرَبِيَّةُ"),
  [Bcp47Code.En]: newWritingSystem(Bcp47Code.En, "English"),
  [Bcp47Code.Es]: newWritingSystem(Bcp47Code.Es, "Español"),
  [Bcp47Code.Fr]: newWritingSystem(Bcp47Code.Fr, "Français"),
  [Bcp47Code.Pt]: newWritingSystem(Bcp47Code.Pt, "Português"),
};

export const defaultWritingSystem = writingSystem[Bcp47Code.Default];

// This list should cover the languages in public/locales/
export const uiWritingSystems = [
  writingSystem[Bcp47Code.Ar],
  writingSystem[Bcp47Code.En],
  writingSystem[Bcp47Code.Es],
  writingSystem[Bcp47Code.Fr],
  writingSystem[Bcp47Code.Pt],
];

// This list should cover the languages in deploy/scripts/semantic_domains/xml/
export const semDomWritingSystems = [
  writingSystem[Bcp47Code.En],
  writingSystem[Bcp47Code.Es],
  writingSystem[Bcp47Code.Fr],
];

// Used by i18n for missing translations.
export const i18nFallbacks = {
  es: [Bcp47Code.Pt, Bcp47Code.Default],
  it: [Bcp47Code.Es, Bcp47Code.Pt, Bcp47Code.Default],
  pt: [Bcp47Code.Es, Bcp47Code.Default],
  default: [Bcp47Code.Default],
};

// Add support for langs covered in i18nFallbacks above.
export const i18nLangs = uiWritingSystems.map((ws) => ws.bcp47).concat(["it"]);

export function newWritingSystem(
  bcp47 = "",
  name = "",
  font = ""
): WritingSystem {
  return { bcp47, name, font };
}
