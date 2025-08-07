import { ConsentType, OffOnSetting, Project, Speaker } from "api/models";
import { newWritingSystem } from "types/writingSystem";
import { randomIntString } from "utilities/utilities";

export function newProject(name = ""): Project {
  return {
    id: "",
    name,
    isActive: true,
    liftImported: false,
    definitionsEnabled: false,
    grammaticalInfoEnabled: false,
    autocompleteSetting: OffOnSetting.On,
    protectedDataMergeAvoidEnabled: OffOnSetting.Off,
    protectedDataOverrideEnabled: OffOnSetting.Off,
    semanticDomains: [],
    semDomWritingSystem: newWritingSystem(),
    vernacularWritingSystem: newWritingSystem(),
    analysisWritingSystems: [newWritingSystem()],
    validCharacters: [],
    rejectedCharacters: [],
    inviteTokens: [],
  };
}

// Randomize properties as needed for tests.
export function randomProject(): Project {
  const project = newProject(randomIntString());
  project.id = randomIntString();
  project.isActive = Math.random() < 0.5;
  return project;
}

export function randomSpeaker(): Speaker {
  return {
    id: randomIntString(),
    projectId: randomIntString(),
    name: randomIntString(),
    consent: ConsentType.None,
  };
}
