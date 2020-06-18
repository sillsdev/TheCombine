import { Project } from "../../../types/project";
import { AutoComplete } from "../../../types/AutoComplete";

export const mockProject: Project = {
  id: "fakeProj",
  name: "Fake proj",
  semanticDomains: [],
  userRoles: "",
  vernacularWritingSystem: "",
  analysisWritingSystems: [],
  validCharacters: [],
  rejectedCharacters: [],
  wordFields: [],
  partsOfSpeech: [],
  words: [],
  customFields: [],
  autocompleteSetting: AutoComplete.Off,
};
