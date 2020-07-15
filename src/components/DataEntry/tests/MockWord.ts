import { Word, DomainWord } from "../../../types/word";

export const mockWord: Word = {
  id: "",
  vernacular: "",
  senses: [
    {
      glosses: [
        {
          language: "en",
          def: "",
        },
      ],
      semanticDomains: [],
    },
  ],
  audio: [],
  created: "",
  modified: "",
  history: [],
  partOfSpeech: "",
  editedBy: [],
  otherField: "",
  plural: "",
};

export const mockDomainWord: DomainWord = {
  word: mockWord,
  gloss: mockWord.senses[0].glosses[0],
};
