import { State } from "../../../../types/word";
import { MergeDupData } from "../../MergeDups";
import { uuid } from "../../../../utilities";

const wordMock = () => ({
  id: uuid(),
  vernacular: "",
  senses: [],
  audio: [""],
  created: "",
  modified: "",
  history: [""],
  partOfSpeech: "",
  editedBy: [""],
  otherField: "",
  plural: "",
});

const wordsArrayMock = () => [
  wordMock(),
  wordMock(),
  wordMock(),
  wordMock(),
  wordMock(),
  wordMock(),
  wordMock(),
  wordMock(),
];

export const goalDataMock: MergeDupData = {
  plannedWords: [
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
  ],
};
