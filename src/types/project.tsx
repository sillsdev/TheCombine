import { randomIntString } from "utilities";
import { SemanticDomain } from "types/word";

export enum AutoComplete {
  Off = "Off",
  On = "On",
}
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
  vernacularWritingSystem: WritingSystem;
  analysisWritingSystems: WritingSystem[];
  validCharacters: string[];
  rejectedCharacters: string[];
  autocompleteSetting: AutoComplete;
  customFields: CustomField[];
  wordFields: string[];
  partsOfSpeech: string[];
}

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
  autocompleteSetting: AutoComplete.On,
};

// Randomize properties as needed for tests.
export function randomProject(): Project {
  let project = { ...defaultProject };
  project.id = randomIntString();
  project.name = randomIntString();
  project.isActive = Math.random() < 0.5;
  return project;
}
