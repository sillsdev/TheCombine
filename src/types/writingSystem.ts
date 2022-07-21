import { WritingSystem } from "api/models";

export enum Bcp47Code {
  Default = "en",
  En = "en",
  Es = "es",
  Fr = "fr",
  Zh = "zh",
}

const writingSystem = {
  [Bcp47Code.En]: newWritingSystem(Bcp47Code.En, "English"),
  [Bcp47Code.Es]: newWritingSystem(Bcp47Code.Es, "Español"),
  [Bcp47Code.Fr]: newWritingSystem(Bcp47Code.Fr, "Français"),
  [Bcp47Code.Zh]: newWritingSystem(Bcp47Code.Zh, "中文"),
};

export const defaultWritingSystem = writingSystem[Bcp47Code.Default];

// This list should cover the languages of public/locales/*/translation.json
export const uiWritingSystems = [
  writingSystem[Bcp47Code.En],
  writingSystem[Bcp47Code.Es],
  writingSystem[Bcp47Code.Fr],
  writingSystem[Bcp47Code.Zh],
];

// This list should cover the domain data in resources/semantic-domains/
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
