import { Word, SemanticDomain } from "./word";
import { AutoComplete } from "./AutoComplete";

export interface CustomField {
  name: string;
  type: string;
}

export interface Project {
  id: string;
  name: string;
  deleted: boolean;
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
  deleted: false,
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
  autocompleteSetting: "Off",
} as Project;
