import { Word } from "./word";

export interface SemanticDomain {
  name: string;
  number: string;
}

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
  characterSet: string[];
  wordFields: string[];
  partsOfSpeech: string[];
  words: Word[];
  customFields: CustomField[];
}
