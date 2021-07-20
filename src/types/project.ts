import { AutocompleteSetting, Project, WritingSystem } from "api/models";
import { randomIntString } from "utilities";

export function newWritingSystem(
  bcp47: string = "",
  name: string = "",
  font: string = ""
): WritingSystem {
  return { bcp47, name, font };
}

export function newProject(name: string = ""): Project {
  return {
    id: "",
    name,
    isActive: true,
    liftImported: false,
    definitionsEnabled: false,
    semanticDomains: [],
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
