import { randomIntString } from "../utilities";
import { AutoComplete } from "./AutoComplete";
import { SemanticDomain, testWordList, Word } from "./word";

export interface CustomField {
  name: string;
  type: string;
}

export interface Project {
  id: string;
  name: string;
  isActive: boolean;
  semanticDomains: SemanticDomain[];
  userRoles: string;
  vernacularWritingSystem: string;
  analysisWritingSystems: string[];
  validCharacters: string[];
  rejectedCharacters: string[];
  wordFields: string[];
  partsOfSpeech: string[];
  words: Word[];
  customFields: CustomField[];
  autocompleteSetting: AutoComplete;
}

export const defaultProject = {
  id: "",
  name: "",
  isActive: true,
  semanticDomains: [],
  userRoles: "",
  vernacularWritingSystem: "",
  analysisWritingSystems: [],
  validCharacters: [],
  rejectedCharacters: [],
  customFields: [],
  wordFields: [],
  partsOfSpeech: [],
  words: [],
  autocompleteSetting: AutoComplete.Off,
} as Project;

// Randomize properties as needed for tests.
export function randomProject(): Project {
  let project = { ...defaultProject };
  project.id = randomIntString();
  project.name = randomIntString();
  project.isActive = Math.random() < 0.5;
  project.words = testWordList();
  return project;
}
