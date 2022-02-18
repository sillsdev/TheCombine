import { WritingSystem } from "api/models";

export enum langCode {
  Default = "en",
  En = "en",
  Es = "es",
  Fr = "fr",
}

const writingSystem = {
  [langCode.En]: newWritingSystem(langCode.En, "English"),
  [langCode.Es]: newWritingSystem(langCode.Es, "Español"),
  [langCode.Fr]: newWritingSystem(langCode.Es, "Français"),
};

export const defaultWritingSystem = writingSystem[langCode.Default];

// This list should cover the languages of resources/translations.json
export const uiWritingSystems = [
  writingSystem[langCode.En],
  writingSystem[langCode.Es],
  writingSystem[langCode.Fr],
];

// This list should cover the domain data in resources/semantic-domains/
export const semDomWritingSystems = [
  writingSystem[langCode.En],
  writingSystem[langCode.Es],
  writingSystem[langCode.Fr],
];

export function newWritingSystem(
  bcp47 = "",
  name = "",
  font = ""
): WritingSystem {
  return { bcp47, name, font };
}
