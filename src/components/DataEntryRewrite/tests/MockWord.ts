import { Word, State } from "../../../types/word";

export const mockWord: Word = {
  id: "",
  vernacular: "",
  senses: [
    {
      glosses: [
        {
          language: "en",
          def: ""
        }
      ],
      semanticDomains: []
    }
  ],
  audio: "",
  created: "",
  modified: "",
  history: [],
  partOfSpeech: "",
  editedBy: [],
  accessability: State.active,
  otherField: "",
  plural: ""
};
