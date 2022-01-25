import { AutocompleteSetting, Project, WritingSystem } from "api/models";
import { randomIntString } from "utilities";

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
