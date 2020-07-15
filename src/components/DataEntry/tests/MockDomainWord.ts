import { mockWord } from "./MockWord";
import { DomainWord } from "../../../types/word";

export const mockDomainWord: DomainWord = {
  word: mockWord,
  gloss: mockWord.senses[0].glosses[0],
};
