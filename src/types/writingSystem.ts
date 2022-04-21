import { WritingSystem } from "api/models";

export enum Bcp47Code {
  Default = "en",
  En = "en",
  Es = "es",
  Fr = "fr",
}

const writingSystem = {
  [Bcp47Code.En]: newWritingSystem(Bcp47Code.En, "English"),
  [Bcp47Code.Es]: newWritingSystem(Bcp47Code.Es, "Español"),
  [Bcp47Code.Fr]: newWritingSystem(Bcp47Code.Fr, "Français"),
};

export const defaultWritingSystem = writingSystem[Bcp47Code.Default];

// This list should cover the languages of resources/translations.json
export const uiWritingSystems = [
  writingSystem[Bcp47Code.En],
  writingSystem[Bcp47Code.Es],
  writingSystem[Bcp47Code.Fr],
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
