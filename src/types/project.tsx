import {
  AutocompleteSetting,
  Project,
  UserRole,
  WritingSystem,
} from "api/models";
import { randomIntString } from "utilities";

// Re-export interfaces from backend models.
export type { Project, UserRole, WritingSystem };

// Re-export enums from backend models.
export { AutocompleteSetting };

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

/**The definition of a particular permission `number`.
 *
 * @remarks
 * This must be kept in sync with the Backend `enum` definition.
 * */
export enum Permission {
  DatabaseAdmin = 6,
  DeleteEditSettingsAndUsers = 5,
  ImportExport = 4,
  MergeAndCharSet = 3,
  Unused = 2,
  WordEntry = 1,
}
