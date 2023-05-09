import { WritingSystem } from "api/models";

export enum Bcp47Code {
  Default = "en",
  Ar = "ar",
  En = "en",
  Es = "es",
  Fr = "fr",
  Pt = "pt",
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

export function newWritingSystem(
  bcp47 = "",
  name = "",
  font = ""
): WritingSystem {
  return { bcp47, name, font };
}
