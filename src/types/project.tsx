import { Word, SemanticDomain } from "./word";

export interface CustomField {
  name: string;
  type: string;
}

export interface Project {
  id: string;
  name: string;
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
}

export const defaultProject = {
  id: "",
  name: "",
  semanticDomains: [],
  userRoles: "",
  vernacularWritingSystem: "",
  analysisWritingSystems: [],
  validCharacters: [],
  rejectedCharacters: [],
  customFields: [],
  wordFields: [],
  partsOfSpeech: [],
  words: []
} as Project;
