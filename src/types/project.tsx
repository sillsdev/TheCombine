import { randomIntString } from "../utilities";
import { AutoComplete } from "./AutoComplete";
import { SemanticDomain, testWordList, Word } from "./word";

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
  semanticDomains: SemanticDomain[];
  userRoles: string;
  vernacularWritingSystem: WritingSystem;
  analysisWritingSystem: WritingSystem;
  validCharacters: string[];
  rejectedCharacters: string[];
  wordFields: string[];
  partsOfSpeech: string[];
  words: Word[];
  customFields: CustomField[];
  autocompleteSetting: AutoComplete;
  font: string;
}

export const defaultProject = {
  id: "",
  name: "",
  isActive: true,
  semanticDomains: [],
  userRoles: "",
  vernacularWritingSystem: { name: "", bcp47: "", font: "" },
  analysisWritingSystem: { name: "", bcp47: "", font: "" },
  validCharacters: [],
  rejectedCharacters: [],
  customFields: [],
  wordFields: [],
  partsOfSpeech: [],
  words: [],
  autocompleteSetting: AutoComplete.Off,
  font: "",
} as Project;

// Randomize properties as needed for tests.
export function randomProject(): Project {
  let project = { ...defaultProject };
  project.id = randomIntString();
  project.name = randomIntString();
  project.vernacularWritingSystem = { name: "", bcp47: "", font: "" };
  project.analysisWritingSystem = { name: "", bcp47: "", font: "" };
  project.font = randomIntString();
  project.isActive = Math.random() < 0.5;
  project.words = testWordList();
  return project;
}
