import { AutocompleteSetting, Project } from "api/models";
import { newWritingSystem } from "types/writingSystem";
import { randomIntString } from "utilities";

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
