export interface SemanticDomain {
  name: string;
  number: string;
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
}
