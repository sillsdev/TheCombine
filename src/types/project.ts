import { AutocompleteSetting, Project, WritingSystem } from "api/models";
import { randomIntString } from "utilities";

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

export function newProject(name = ""): Project {
  return {
    id: "",
    name,
    isActive: true,
    liftImported: false,
    definitionsEnabled: false,
    semanticDomains: [],
    semDomWritingSystem: newWritingSystem(),
    vernacularWritingSystem: newWritingSystem(),
    analysisWritingSystems: [newWritingSystem()],
    validCharacters: [],
    rejectedCharacters: [],
    inviteTokens: [],
    autocompleteSetting: AutocompleteSetting.On,
  };
}

// Randomize properties as needed for tests.
export function randomProject(): Project {
  const project = newProject(randomIntString());
  project.id = randomIntString();
  project.isActive = Math.random() < 0.5;
  return project;
}
