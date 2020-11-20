import { randomIntString } from "../utilities";
import { AutoComplete } from "./AutoComplete";
import { SemanticDomain } from "./word";

export interface CustomField {
  name: string;
  type: string;
}
export interface WritingSystem {
  name: string;
  bcp47: string;
  font: string;
}
export interface Project {
  id: string;
  name: string;
  isActive: boolean;
  liftImported: boolean;
  semanticDomains: SemanticDomain[];
  userRoles: string;
  vernacularWritingSystem: WritingSystem;
  analysisWritingSystems: WritingSystem[];
  validCharacters: string[];
  rejectedCharacters: string[];
  wordFields: string[];
  partsOfSpeech: string[];
  customFields: CustomField[];
  autocompleteSetting: AutoComplete;
}

export const defaultProject = {
  id: "",
  name: "",
  isActive: true,
  liftImported: false,
  semanticDomains: [],
  userRoles: "",
  vernacularWritingSystem: { name: "", bcp47: "", font: "" },
  analysisWritingSystems: [{ name: "", bcp47: "", font: "" }],
  validCharacters: [],
  rejectedCharacters: [],
  customFields: [],
  wordFields: [],
  partsOfSpeech: [],
  autocompleteSetting: AutoComplete.On,
} as Project;

// Randomize properties as needed for tests.
export function randomProject(): Project {
  let project = { ...defaultProject };
  project.id = randomIntString();
  project.name = randomIntString();
  project.isActive = Math.random() < 0.5;
  return project;
}
