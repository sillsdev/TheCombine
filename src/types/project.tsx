import {
  AutocompleteSetting,
  Permission,
  Project,
  UserRole,
  WritingSystem,
} from "api/models";
import { randomIntString } from "utilities";

// Re-export interfaces from backend models.
export type { Project, UserRole, WritingSystem };

// Re-export enums from backend models.
export { AutocompleteSetting, Permission };

export const defaultProject: Project = {
  id: "",
  name: "",
  isActive: true,
  liftImported: false,
  semanticDomains: [],
  vernacularWritingSystem: { name: "", bcp47: "", font: "" },
  analysisWritingSystems: [{ name: "", bcp47: "", font: "" }],
  validCharacters: [],
  rejectedCharacters: [],
  customFields: [],
  wordFields: [],
  partsOfSpeech: [],
  inviteTokens: [],
  autocompleteSetting: AutocompleteSetting.On,
};

// Randomize properties as needed for tests.
export function randomProject(): Project {
  let project = { ...defaultProject };
  project.id = randomIntString();
  project.name = randomIntString();
  project.isActive = Math.random() < 0.5;
  return project;
}
