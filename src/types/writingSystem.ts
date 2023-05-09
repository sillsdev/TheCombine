import { WritingSystem } from "api/models";

export enum Bcp47Code {
  Default = "en",
  Ar = "ar",
  En = "en",
  Es = "es",
  Fr = "fr",
  Hi = "hi",
  Ml = "ml",
  My = "my",
  Pt = "pt",
  Ru = "ru",
  Sw = "sw",
}

const writingSystem = {
  [Bcp47Code.Ar]: newWritingSystem(Bcp47Code.Ar, "اَلْعَرَبِيَّةُ"), // Arabic
  [Bcp47Code.En]: newWritingSystem(Bcp47Code.En, "English"),
  [Bcp47Code.Es]: newWritingSystem(Bcp47Code.Es, "Español"), // Spanish
  [Bcp47Code.Fr]: newWritingSystem(Bcp47Code.Fr, "Français"), // French
  [Bcp47Code.Hi]: newWritingSystem(Bcp47Code.Hi, "हिन्दी"), // Hindi
  [Bcp47Code.Ml]: newWritingSystem(Bcp47Code.Ml, "മലയാളം"), // Malayalam
  [Bcp47Code.My]: newWritingSystem(Bcp47Code.My, "မြန်မာစာ"), // Burmese
  [Bcp47Code.Pt]: newWritingSystem(Bcp47Code.Pt, "Português"), // Portuguese
  [Bcp47Code.Ru]: newWritingSystem(Bcp47Code.Ru, "русский язык"), // Russian
  [Bcp47Code.Sw]: newWritingSystem(Bcp47Code.Sw, "Kiswahili"), // Swahili
};

export const defaultWritingSystem = writingSystem[Bcp47Code.Default];

// This list should cover the languages in public/locales/
export const uiWritingSystems = [
  writingSystem[Bcp47Code.Ar],
  writingSystem[Bcp47Code.En],
  writingSystem[Bcp47Code.Es],
  writingSystem[Bcp47Code.Fr],
];

// This list should cover the languages in deploy/scripts/semantic_domains/xml/
export const semDomWritingSystems = [
  writingSystem[Bcp47Code.Ar],
  writingSystem[Bcp47Code.En],
  writingSystem[Bcp47Code.Es],
  writingSystem[Bcp47Code.Fr],
  writingSystem[Bcp47Code.Hi],
  writingSystem[Bcp47Code.Ml],
  writingSystem[Bcp47Code.My],
  writingSystem[Bcp47Code.Pt],
  writingSystem[Bcp47Code.Ru],
  writingSystem[Bcp47Code.Sw],
];

export function newWritingSystem(
  bcp47 = "",
  name = "",
  font = ""
): WritingSystem {
  return { bcp47, name, font };
}
