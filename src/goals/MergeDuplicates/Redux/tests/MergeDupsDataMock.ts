import { Word } from "api/models";
import { MergeDupsData } from "goals/MergeDuplicates/MergeDupsTypes";
import { simpleWord } from "types/word";

const wordsArrayMock = (): Word[] => [
  // Each simpleWord() has a randomly generated id
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
];

export const goalDataMock: MergeDupsData = {
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
