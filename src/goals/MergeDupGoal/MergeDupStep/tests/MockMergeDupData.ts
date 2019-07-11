import { Word, State } from "../../../../types/word";
import { MergeDupData } from "../../MergeDups";

export const wordMock: Word = {
  id: "",
  vernacular: "",
  senses: [],
  audio: "",
  created: "",
  modified: "",
  history: [""],
  partOfSpeech: "",
  editedBy: [""],
  accessability: State.active,
  otherField: "",
  plural: ""
};

export const wordsArrayMock: Word[] = [
  wordMock,
  wordMock,
  wordMock,
  wordMock,
  wordMock,
  wordMock,
  wordMock,
  wordMock
];

export const goalDataMock: MergeDupData = {
  plannedWords: [
    wordsArrayMock,
    wordsArrayMock,
    wordsArrayMock,
    wordsArrayMock,
    wordsArrayMock,
    wordsArrayMock,
    wordsArrayMock,
    wordsArrayMock
  ]
};
